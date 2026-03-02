# Tasks: 加入 KPI 和圖表區塊

## Phase 1: 組件結構與樣式
- [x] **T1.1** 建立 `KPIAndChartsSection.jsx` 容器組件
  - 定義 props 介面 (`company`, `metrics`)
  - 建立基本 layout 結構 (左側 KPI + 右側圖表)
  - 驗證: 組件正確渲染於 HomePage

- [x] **T1.2** 新增 CSS 樣式於 `main.css`
  - `.kpi-charts-section` 容器樣式
  - `.kpi-panel` 左側面板樣式 (25% 寬度)
  - `.charts-grid` 右側圖表網格樣式 (2x3)
  - `.chart-item` 圖表項目樣式
  - 響應式斷點 (@media queries)
  - 驗證: 佈局在不同螢幕尺寸下正確顯示

## Phase 2: KPI 分析面板
- [x] **T2.1** 建立 `ExecutiveSummaryCard.jsx`
  - 實作 `generateExecutiveSummary()` 分析邏輯
  - 顯示自動生成的分析文字
  - 樣式: 卡片式設計，帶標題和內容區
  - 驗證: 文字根據資料正確生成
  - 注意: 目前顯示「分析內容將由 AI 產生」預留位置

- [x] **T2.2** 建立 `PositiveIndicatorsCard.jsx`
  - 實作 `getPositiveIndicators()` 篩選邏輯 (19項正面指標)
  - 列表顯示正面指標（綠色圖標）
  - 驗證: 正面指標正確識別並顯示

- [x] **T2.3** 建立 `ConcernIndicatorsCard.jsx`
  - 實作 `getConcernIndicators()` 篩選邏輯 (32項風險指標)
  - 列表顯示風險指標（紅色/橙色圖標）
  - 驗證: 風險指標正確識別並顯示

## Phase 3: 圖表組件
- [x] **T3.1** 建立 `ProfitabilityChart.jsx` (獲利能力)
  - 整合淨利率、毛利率、ROA 資料
  - 使用 Nivo LineChart
  - 驗證: 圖表資料與詳細財務數據表一致

- [x] **T3.2** 建立 `SolvencyChart.jsx` (償債結構)
  - 整合流動比率、速動比率、負債淨值比
  - 數值需除以 100 顯示小數
  - 驗證: 圖表資料正確

- [x] **T3.3** 建立 `AREfficiencyChart.jsx` (經營效率)
  - 整合應收週轉資料
  - 使用混合圖 (長條 + 折線)
  - 驗證: 圖表正確顯示

- [x] **T3.4** 建立 `InventoryChart.jsx` (存貨週轉)
  - 整合存貨周轉資料
  - 處理異常值 (如 31331)
  - 驗證: 圖表正確顯示，異常值已處理

- [x] **T3.5** 建立 `GrowthChart.jsx` (成長動能)
  - 整合營收成長率、稅前淨利成長率
  - 固定顏色配置：營收成長(藍色)、稅前淨利成長(橙色)
  - 移除 y 軸和格線
  - 折線端點顯示成長率數值
  - 圖例顯示於底部中間
  - 調整高度與 ProfitabilityChart 一致 (320px)
  - 驗證: 圖表正確顯示成長率數值

- [x] **T3.6** 建立 `ExpenseTrendChart.jsx` (費用率趨勢)
  - 整合推銷費用、管理費用、研發費用佔比
  - 圖例名稱：推銷%、管理%、研發%
  - 移除 y 軸和格線
  - 折線端點顯示百分比數值
  - 移除互動功能（靜態顯示）
  - 圖例顯示於底部中間
  - 調整高度與 ProfitabilityChart 一致 (320px)
  - 驗證: 圖表正確顯示費用率數值

## Phase 4: 整合與測試
- [x] **T4.1** 整合至 HomePage
  - 在 FinanceChart 和 FinancialDataTable 之間插入 KPIAndChartsSection
  - 傳遞 company props
  - 驗證: 位置正確，資料流動正常

- [x] **T4.2** 響應式測試
  - 測試桌面版 (>1024px)
  - 測試平板版 (768px-1024px)
  - 測試手機版 (<768px)
  - 驗證: 各尺寸下佈局正確

- [x] **T4.3** 跨公司測試
  - 測試不同公司的資料顯示
  - 驗證: 資料不足時的降級顯示

- [x] **T4.4** 圖表測試與驗證
  - 新增 `tests/growth-chart.spec.js`
  - 新增 `tests/expense-trend-chart.spec.js`
  - 測試圖例正確性
  - 測試 y 軸和格線移除
  - 測試端點數值標籤顯示
  - 驗證: 測試通過，截圖確認

## Dependencies
- T1.x 可與 T2.x 平行開發
- T3.x 各圖表可平行開發
- T4.x 需等待 T1-T3 完成

## Validation Criteria
- 所有圖表資料與「詳細財務數據表」數值一致
- KPI 分析文字語句通順、邏輯合理
- 響應式佈局在各裝置上正常運作
- 無 console 錯誤

## Recent Improvements (2025-01-28)

### 成長動能圖表優化
- ✅ 改為固定顏色配置（藍色/橙色），避免紅色被誤解為負成長
- ✅ 移除 y 軸和格線，簡化視覺
- ✅ 新增折線端點數值標籤（PointLabelsLayer）
- ✅ 調整圖例位置至底部中間，與圖表保留間隙
- ✅ 統一高度為 320px，提升可讀性

### 費用率趨勢圖表優化
- ✅ 修改圖例名稱（推銷%、管理%、研發%）
- ✅ 移除 y 軸和格線，簡化視覺
- ✅ 新增折線端點數值標籤（PointLabelsLayer）
- ✅ 移除互動功能，改為靜態顯示
- ✅ 調整圖例位置至底部中間，與圖表保留間隙
- ✅ 統一高度為 320px，提升可讀性

### 測試覆蓋
- ✅ 新增 GrowthChart 之 Playwright 測試
- ✅ 新增 ExpenseTrendChart 之 Playwright 測試
- ✅ 驗證圖例、數值標籤、y 軸移除等功能
