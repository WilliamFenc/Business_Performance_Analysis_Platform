# 實作任務：Excel 匯入/匯出功能

## 實作狀態

**開始日期**: 2026-02-02
**完成日期**: 2026-02-03
**狀態**: ✅ 已完成（核心功能）

---

## 階段一：環境準備與 API 設計

- [x] **Task 1.1**：安裝後端依賴 `exceljs` ✅ (2026-02-02)
- [x] **Task 1.2**：設計批次匯入 API payload 格式 ✅ (2026-02-02)
- [x] **Task 1.3**：設計匯出 API 回應格式 ✅ (2026-02-02)

## 階段二：後端 API 實作

### 財務報表 (financial_basics)

- [x] **Task 2.1**：實作 `POST /api/financial-basics/batch-import` ✅ (2026-02-02)
  - 接收 Excel 資料
  - PK 判斷 (fiscal_year + tax_id)
  - Upsert 邏輯
  - 錯誤處理與回應

- [x] **Task 2.2**：實作 `GET /api/financial-basics/export` ✅ (2026-02-02)
  - 查詢資料（支援篩選）
  - **生成包含「財務報表」和「損益表」兩個 sheet 的 Excel 檔案**
  - 回傳檔案串流

### 損益表 (pl_income_basics)

- [x] **Task 2.3**：實作 `POST /api/pl-income/batch-import` ✅ (2026-02-02)
  - 接收 Excel 資料
  - PK 判斷 (fiscal_year + tax_id)
  - Upsert 邏輯
  - 錯誤處理與回應

- [x] **Task 2.4**：實作 `GET /api/pl-income/export` ✅ (2026-02-02)
  - 查詢資料（支援篩選）
  - 生成 Excel（雙列標題格式）
  - 回傳檔案串流

### 功能改進 (2026-02-02 ~ 2026-02-03)

- [x] **Task 2.5**：合併匯出功能 ✅ (2026-02-02)
  - 修改 `/api/financial-basics/export` 同時查詢財務報表與損益表
  - 生成包含兩個 sheet 的 Excel 檔案
  - 前端統一使用此端點匯出

- [x] **Task 2.6**：修正中文編碼問題 ✅ (2026-02-03)
  - 修改 `excelParser.js` 使用 `raw: false` 選項
  - 確保 `company_name` 和 `account_item` 正確顯示中文

## 階段三：前端組件實作

### 工具函式

- [x] **Task 3.1**：實作 `src/utils/excelParser.js` ✅ (2026-02-02)
  - 解析 Excel 檔案
  - 欄位對應（主要規則：英文名稱 → column_name）
  - 欄位對應（次要規則：中文名稱 → column_description）
  - 驗證必要欄位

- [x] **Task 3.2**：實作 `src/utils/excelGenerator.js`（可選，使用後端匯出） ✅ (2026-02-02)

### UI 組件

- [x] **Task 3.3**：實作 `src/components/ExcelImportButton.jsx` ✅ (2026-02-02)
  - 檔案選擇器
  - 與 ImportPreviewModal 整合

- [x] **Task 3.4**：實作 `src/components/ExcelExportButton.jsx` ✅ (2026-02-02)
  - 呼叫後端 API 下載檔案
  - **統一使用包含兩個 sheet 的匯出端點 (2026-02-02)**

- [x] **Task 3.5**：實作 `src/components/ImportPreviewModal.jsx` ✅ (2026-02-02)
  - 顯示將新增/更新的筆數
  - 顯示無法對應的欄位警告
  - 確認後執行匯入
  - 顯示匯入結果
  - **匯入成功後自動重新整理網頁 (2026-02-02)**

- [x] **Task 3.6**：實作匯入結果通知（整合在 ImportPreviewModal） ✅ (2026-02-02)

### 整合

- [x] **Task 3.7**：修改 `src/components/DataManagerTabs.jsx` ✅ (2026-02-02)
  - 新增「從 Excel 匯入」按鈕
  - 新增「匯出 Excel」按鈕

- [x] **Task 3.8**：修改 `src/pages/HomePage.jsx` ✅ (2026-02-02)
  - 新增匯入/匯出狀態管理
  - 匯入後重新整理資料

## 階段四：測試

- [ ] **Task 4.1**：單元測試 - Excel 解析器
- [ ] **Task 4.2**：單元測試 - 欄位對應邏輯
- [x] **Task 4.3**：整合測試 - 匯入流程 ✅ (2026-02-03 手動測試)
- [x] **Task 4.4**：整合測試 - 匯出流程 ✅ (2026-02-03 手動測試)
- [ ] **Task 4.5**：E2E 測試（使用 Playwright）

## 階段五：文件與部署

- [x] **Task 5.1**：更新使用者文件（操作說明） ✅ (2026-02-03)
- [x] **Task 5.2**：更新 API 文件 ✅ (2026-02-03)
- [x] **Task 5.3**：部署到 Vercel ✅ (已完成)

## 檢查清單

### 功能完整性
- [x] 支援「財務報表」匯入/匯出
- [x] 支援「損益表」匯入/匯出
- [x] **匯出 Excel 包含「財務報表」和「損益表」兩個 sheet (2026-02-02)**
- [x] **匯入成功後自動重新整理網頁 (2026-02-02)**
- [x] 欄位對應（主要規則 + 次要規則）
- [x] PK 判斷與 Upsert 邏輯
- [x] 錯誤處理與使用者提示

### 測試覆蓋
- [x] 正常情況測試（手動測試通過）
- [x] 邊界情況測試（手動測試通過）
- [x] 錯誤情況測試（編碼問題已修正）

### 程式碼品質
- [ ] TypeScript 類型定義（若使用 TS）
- [x] 錯誤處理完整
- [x] 程式碼符合專案風格
- [x] 中文字串編碼正確處理

## 已知問題與限制

### 已解決
- ~~中文字串編碼問題~~ (2026-02-03 已修正)

### 待改進
- 單元測試覆蓋率待提升
- E2E 測試待建立
