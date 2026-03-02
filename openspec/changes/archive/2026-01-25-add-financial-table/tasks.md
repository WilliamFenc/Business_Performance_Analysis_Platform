# Tasks: 加入「詳細財務數據表」

## 實作狀態：已完成 ✅

## Implementation Tasks

### Phase 1: 後端 API

- [x] **Task 1.1**: 建立 `api/financial/basics.js` API 端點
  - 實作 GET 方法處理
  - 接收 `company` 查詢參數
  - 呼叫 Supabase 查詢 `pl_income_basics` 和 `financial_basics`

- [x] **Task 1.2**: 實作指標計算邏輯
  - 淨利率、毛利率、ROA
  - 流動比率、速動比率、負債淨值比
  - 應收帳款週轉率、存貨周轉率
  - 營收成長率、毛利成長率、稅前淨利成長率
  - 推銷費用占比、管理費用佔比、研發費用佔比
  - 處理除以零和 null 值情況

- [x] **Task 1.3**: 單位轉換
  - 將 Supabase 千元單位除以 1000 轉為百萬元
  - 確保與現有圖表單位一致

- [x] **Task 1.4**: 錯誤處理
  - 公司不存在時回傳錯誤
  - API 失敗時回傳適當錯誤訊息

### Phase 2: 前端組件

- [x] **Task 2.1**: 建立 `FinancialDataTable.jsx` 組件
  - 定義 Props 介面（company, metrics, isLoading, error）
  - 實作表格渲染邏輯
  - 處理載入狀態

- [x] **Task 2.2**: 實作表格樣式
  - 14 欄 × 年度列 表格布局
  - 年度欄位固定左側（sticky）
  - 響應式橫向捲動
  - 與現有設計風格一致

- [x] **Task 2.3**: 數值格式化
  - 百分比顯示至小數點後兩位
  - 週轉率顯示至小數點後兩位
  - null 值顯示「-」

- [x] **Task 2.4**: 整合至 `HomePage.jsx`
  - 在 `FinanceChart` 之後、`DataManagerTabs` 之前插入組件
  - 加入載入狀態管理
  - 加入 API 呼叫邏輯

### Phase 3: 測試與驗證

- [x] **Task 3.1**: 手動測試
  - 驗證各指標計算正確性
  - 測試 null 值顯示
  - 測試響應式布局

- [x] **Task 3.2**: 本地預覽
  - 啟動本地 dev server (http://localhost:5174)
  - 確認表格顯示正確

### Phase 4: 部署

- [x] **Task 4.1**: 本地驗收
  - 確認所有功能正常
  - 確認設計一致性

- [x] **Task 4.2**: 提交程式碼
  - Commit: `cc52d99` - 初版實作
  - Commit: `dc77b9b` - 版面調整與表格轉置
  - Push 至 GitHub (`feature/add-financial-table` 分支)

- [x] **Task 4.3**: 部署至 Vercel
  - 執行 `npx vercel --prod`
  - 驗證生產環境 (https://bpap.vercel.app)

## 實作過程中的修改

### 修改 1: 全螢幕寬度版面
- **原因**: 使用者要求版面寬度拉到符合最大螢幕寬度
- **變更**:
  - `.container` 的 `max-width` 從 `1200px` 改為 `100%`
  - 移除 `border-radius`、`box-shadow`、`border`
  - 調整 padding 為 `var(--space-3xl) var(--space-2xl)`

### 修改 2: 表格轉置（Pivot）
- **原因**: 使用者要求詳細財務數據表轉置顯示
- **原設計**: 指標名稱在左側（列），年度在頂部（欄位）
- **修改後**: 年度在左側（第一欄），指標名稱在頂部（欄位）
- **變更**:
  - `FinancialDataTable.jsx`: 重新排列表格結構
  - CSS: 更新 `.year-header`、`.metric-header`、`.year-value` 樣式
  - 表格最小寬度從 `900px` 調整為 `1400px`

## Dependencies

- Task 1.2 必須在 Task 1.1 之後完成
- Task 2.4 必須在 Task 2.1-2.3 之後完成
- Task 4.x 必須在 Phase 1-3 完成後執行

## Completion Summary

- Phase 1: 後端 API - ✅ 完成
- Phase 2: 前端組件 - ✅ 完成
- Phase 3: 測試驗證 - ✅ 完成
- Phase 4: 部署 - ✅ 完成

## Git Commits

1. `cc52d99` - feat: add detailed financial metrics table
2. `dc77b9b` - refactor: full-width layout and pivot financial table

## Production URL

https://bpap.vercel.app

