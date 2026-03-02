# Change: 讓財務指標 KPI 計算支援年度動態切換

## Why

目前 KPI 指標（正面指標、風險/關注指標）的計算邏輯固定使用**最新年度**的資料，當使用者在「績效洞察」面板下拉選擇不同年度時，KPI 卡片顯示的指標不會跟着變化，造成使用者體驗不一致。

使用者期望：
- 選擇 2024 年時，KPI 應該以 2024 年為基準計算
- 選擇 2023 年時，KPI 應該以 2023 年為基準計算
- 年度比較指標（如毛利率改善）應比較「選擇年度」vs「前一年度」
- 連續趨勢指標（如「連續三年負成長」）應根據選擇年度往前推算

## What Changes

### 核心變更

1. **`KPIAndChartsSection` 組件**
   - 新增 `selectedYear` prop
   - 將 `selectedYear` 傳遞給 `PositiveIndicatorsCard` 和 `ConcernIndicatorsCard`

2. **`PositiveIndicatorsCard` 組件**
   - 修改 `getLatestYear(metrics)` → `getSelectedYear(metrics, selectedYear)`
   - 修改 `getPreviousYear(metrics)` → `getPreviousYearBySelected(metrics, selectedYear)`
   - 修改「連續三年」相關函式，使其根據 `selectedYear` 往前推算

3. **`ConcernIndicatorsCard` 組件**
   - 與 `PositiveIndicatorsCard` 相同的變更

4. **`HomePage` 組件**
   - 將 `selectedYear` 和 `onYearChange` 傳遞給 `KPIAndChartsSection`

### 資料不足處理策略

當選擇年度的資料不足時（例如選 2022 年但只有 2021-2022 兩年資料）：
- **連續三年指標**：使用可用年度判斷（有 2 年就判斷 2 年趨勢）
- **年度比較指標**：如果沒有前一年度資料，該指標不顯示
- **單年度指標**：只要有選擇年度的資料就正常計算

## Impact

- 影響的 specs:
  - `financial-data-table` (需擴展以支援年度依賴的 KPI 計算)

- 影響的檔案:
  - `src/components/KPIAndChartsSection.jsx` - 新增 selectedYear prop
  - `src/components/PositiveIndicatorsCard.jsx` - 修改計算邏輯
  - `src/components/ConcernIndicatorsCard.jsx` - 修改計算邏輯
  - `src/pages/HomePage.jsx` - 傳遞 selectedYear

### 非功能性影響

- **向後相容性**：如果未提供 `selectedYear`，預設使用最新年度（保持現有行為）
- **效能**：無顯著影響，只是改變資料取用索引
- **測試**：需新增年度切換情境的 E2E 測試

## Reference

- 財務指標判斷規則參照：`財務分析指標.xlsx` > `財務比率說明` sheet
- 相關現有程式碼：
  - `src/components/InsightPanel.jsx` - 已實作年度選擇和年度依賴的洞察顯示
  - `src/components/FinanceChart.jsx` - 已實作年度依賴的圖表高亮
