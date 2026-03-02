# Implementation Tasks

## Phase 1: 修改資料取得邏輯

### 1.1 修改 `PositiveIndicatorsCard.jsx`
- [x] 新增 `selectedYear` prop（可選，預設使用最新年度）
- [x] 重構 `getLatestYear(metrics)` → `getSelectedYearData(metrics, selectedYear)`
  - 接受 `selectedYear` 參數，找到對應的年度索引
  - 若未提供或找不到，回傳最新年度資料
- [x] 重構 `getPreviousYear(metrics)` → `getPreviousYearData(metrics, selectedYear)`
  - 根據 `selectedYear` 找到前一年度資料
- [x] 更新「連續三年」相關函式：
  - `isPositiveGrowth(metrics, metricKey, selectedYear, requiredYears)`
  - `isAboveThreshold(metrics, metricKey, threshold, selectedYear, requiredYears)`
  - 必須有足夠年數（requiredYears）才判斷，否則回傳 false

### 1.2 修改 `ConcernIndicatorsCard.jsx`
- [x] 套用與 1.1 相同的變更
  - 新增 `isNegativeGrowth(metrics, metricKey, selectedYear, requiredYears)`
  - 新增 `isBelowThreshold(metrics, metricKey, threshold, selectedYear, requiredYears)`
- [x] Bug 修正：移除內聯樣式 `fontSize: '11px'`，使其與 PositiveIndicatorsCard 字體一致

### 1.3 修改 `KPIAndChartsSection.jsx`
- [x] 新增 `selectedYear` prop（可選）
- [x] 將 `selectedYear` 傳遞給 `PositiveIndicatorsCard` 和 `ConcernIndicatorsCard`

## Phase 2: 更新 HomePage 整合

### 2.1 修改 `HomePage.jsx`
- [x] 將 `selectedYear` 傳遞給 `KPIAndChartsSection`

## Phase 3: 測試

### 3.1 Bug 修正 - 連續三年判斷邏輯
- [x] 修正「連續三年」指標必須真的有 3 年資料才判斷
- [x] 當資料不足（如只有 1-2 年）時，該指標不顯示

### 3.2 UI 一致性修正
- [x] 移除 ConcernIndicatorsCard 的內聯字體樣式，使其與 PositiveIndicatorsCard 一致

### 3.3 手動測試情境
- [x] 選擇 2021 年（最早年度），驗證「連續三年負成長」不再誤顯示
- [x] 選擇中間年度（如 2023），驗證 KPI 以該年度為基準
- [x] 選擇最新年度，驗證行為與原本一致
- [x] 驗證兩個 KPI 卡片字體大小一致

## Phase 4: 驗收

### 4.1 功能驗收
- [x] 切換年度後，正面指標卡片內容跟着更新
- [x] 切換年度後，風險指標卡片內容跟着更新
- [x] 「連續三年」指標必須真的有 3 年資料才會顯示
- [x] 向後相容：未傳 selectedYear 時使用最新年度

### 4.2 邊際情況處理
- [x] 公司只有 1 年資料時，不會顯示「連續三年」相關指標
- [x] 選擇最早年度時，前年度比較指標不顯示（無前一年資料）
- [x] 選擇不存在的年度時，使用最新年度
