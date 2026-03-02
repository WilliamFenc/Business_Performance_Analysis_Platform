# Design: 年度依賴的 KPI 計算

## Overview

本文描述如何修改 KPI 計算邏輯，使其根據使用者選擇的年度動態計算，而非固定使用最新年度。

## Current Architecture

```
HomePage
  ├── selectedYear (state)
  ├── InsightPanel (使用 selectedYear) ✓
  ├── FinanceChart (使用 selectedYear) ✓
  └── KPIAndChartsSection (未使用 selectedYear) ✗
        ├── PositiveIndicatorsCard (固定用最新年度) ✗
        └── ConcernIndicatorsCard (固定用最新年度) ✗
```

## Target Architecture

```
HomePage
  ├── selectedYear (state)
  ├── InsightPanel (selectedYear) ✓
  ├── FinanceChart (selectedYear) ✓
  └── KPIAndChartsSection (selectedYear) ✓
        ├── PositiveIndicatorsCard (selectedYear) ✓
        └── ConcernIndicatorsCard (selectedYear) ✓
```

## Data Flow

### 1. 年度資料定位

```javascript
// 找到選擇年度在 years 陣列中的索引
function getYearIndex(metrics, selectedYear) {
  if (!selectedYear || !metrics.years) return -1;
  const idx = metrics.years.indexOf(selectedYear);
  return idx !== -1 ? idx : metrics.years.length - 1; // 找不到則用最新年度
}

// 取得選擇年度的資料
function getSelectedYearData(metrics, selectedYear) {
  const idx = getYearIndex(metrics, selectedYear);
  return {
    year: metrics.years[idx],
    netProfitMargin: metrics.netProfitMargin[idx],
    grossMargin: metrics.grossMargin[idx],
    // ... 其他欄位
  };
}
```

### 2. 連續年度趨勢計算

```javascript
// 從選擇年度往前取 n 年資料
function getPreviousYearsData(metrics, selectedYear, count) {
  const idx = getYearIndex(metrics, selectedYear);
  const startIndex = Math.max(0, idx - count + 1);
  const years = metrics.years.slice(startIndex, idx + 1);
  return {
    years,
    data: years.map(y => ({
      year: y,
      value: metrics[metricKey][metrics.years.indexOf(y)]
    }))
  };
}

// 檢查連續 n 年正成長
function isPositiveGrowth(metrics, metricKey, selectedYear, requiredYears = 3) {
  const idx = getYearIndex(metrics, selectedYear);
  const startIndex = Math.max(0, idx - requiredYears + 1);
  const values = metrics[metricKey].slice(startIndex, idx + 1);

  if (values.length < 2) return false; // 至少需要 2 年才能判斷成長

  // 使用可用資料判斷
  for (let i = 1; i < values.length; i++) {
    if (values[i] === null || values[i-1] === null) return false;
    if (values[i] <= values[i-1]) return false;
  }
  return true;
}
```

## Component API Changes

### KPIAndChartsSection

```javascript
// Before
function KPIAndChartsSection({ company })

// After
function KPIAndChartsSection({ company, selectedYear })
```

### PositiveIndicatorsCard / ConcernIndicatorsCard

```javascript
// Before
function PositiveIndicatorsCard({ metrics })

// After
function PositiveIndicatorsCard({ metrics, selectedYear })

// selectedYear 為可選，未提供時使用最新年度（向後相容）
```

## Backward Compatibility

為了保持向後相容：
- `selectedYear` 為可選 prop
- 未提供時預設使用 `metrics.years[metrics.years.length - 1]`（最新年度）
- 現有未傳 `selectedYear` 的呼叫點不需要修改

## Edge Cases

| 情境 | 行為 |
|------|------|
| selectedYear 不存在於資料中 | 使用最新年度 |
| 公司只有 1 年資料 | 單年度指標正常顯示，比較指標不顯示 |
| selectedYear 是最早年度 | 前年度比較指標不顯示（無前一年資料） |
| 連續 n 年但資料不足 | 使用可用資料判斷（如需 3 年但只有 2 年，就用 2 年判斷） |
