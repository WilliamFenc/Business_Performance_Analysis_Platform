# 多欄位 CRUD 表單 - 實作任務

> **狀態**: ✅ 核心功能已完成（2025-02-02）

## 階段 1：後端 API 開發 ✅

### 1.1 建立財務報表 API 端點
- [x] 新增 `api/financial-basics/index.js` - GET/POST 端點
  - GET: 查詢所有 financial_basics 資料
  - POST: 新增一筆 financial_basics 資料（upsert）
  - 使用 Supabase client 連線
  - 實作錯誤處理與 CORS
- [x] 新增 `api/financial-basics/[taxId]/[year]/index.js` - PUT/DELETE 端點
  - PUT: 更新指定 (taxId, year) 的資料
  - DELETE: 刪除指定 (taxId, year) 的資料
  - 路徑參數驗證

### 1.2 建立損益表 API 端點
- [x] 新增 `api/pl-income/index.js` - GET/POST 端點
  - GET: 查詢所有 pl_income_basics 資料
  - POST: 新增一筆 pl_income_basics 資料（upsert）
  - 使用 Supabase client 連線
  - 實作錯誤處理與 CORS
- [x] 新增 `api/pl-income/[taxId]/[year]/index.js` - PUT/DELETE 端點
  - PUT: 更新指定 (taxId, year) 的資料
  - DELETE: 刪除指定 (taxId, year) 的資料
  - 路徑參數驗證

### 1.3 API 測試
- [x] 使用 curl/Postman 測試所有端點
- [x] 驗證 upsert 邏輯（重複主鍵更新而非新增）
- [x] 驗證錯誤處理（連線失敗、無效參數）

## 階段 2：前端元件開發 ✅

### 2.1 建立共用的 Accordion 組件
- [x] 新增 `src/components/AccordionSection.jsx`
  - 接受 title, isOpen, onToggle, children props
  - 實作展開/摺疊動畫
  - 支援鍵盤操作（Enter, Space）

### 2.2 建立財務報表表單組件
- [x] 新增 `src/components/FinancialReportForm.jsx`
  - 定義 80+ 欄位的分類結構
  - 實作 Accordion 區塊（基本資訊、流動資產、非流動資產、流動負債、非流動負債、權益）
  - 實作表單驗證
  - 支援新增與編輯模式
  - 整合公司下拉選單

### 2.3 建立損益表表單組件
- [x] 新增 `src/components/IncomeStatementForm.jsx`
  - 定義 26 欄位的分類結構
  - 實作 Accordion 區塊（基本資訊、營業項目、營業費用、營業外損益、淨利相關）
  - 實作表單驗證
  - 支援新增與編輯模式
  - 整合公司下拉選單

### 2.4 更新 DataTable 元件
- [x] 修改 `src/components/DataTable.jsx`
  - 改為動態欄位渲染（接受 columns 配置）
  - 加入水平捲動支援
  - 實作欄位凍結（前兩欄）
  - 保持現有的排序、篩選、分頁功能

### 2.5 更新 EditModal 元件
- [x] 修改 `src/components/EditModal.jsx`
  - 整合 Accordion 表單（根據 reportType 顯示不同表單）
  - Modal 寬度加大（max-width: 900px）
  - 支援「全部展開」和「全部摺疊」按鈕

### 2.6 更新 DataManagerTabs 元件
- [x] 修改 `src/components/DataManagerTabs.jsx`
  - Tab 從「快速新增」和「數據表格」改為「財務報表」和「損益表」
  - 每個 Tab 顯示對應的 DataTable

## 階段 3：狀態管理與整合 ✅

### 3.1 更新 HomePage 狀態管理
- [x] 修改 `src/pages/HomePage.jsx`
  - 新增 `activeReportTab` 狀態
  - 新增 `financialBasicsData` 狀態
  - 新增 `plIncomeData` 狀態
  - 新增載入兩種報表的 API 呼叫函式
  - 更新 EditModal 的 onSave 處理邏輯

### 3.2 更新 ControlPanel 元件
- [x] 修改 `src/components/ControlPanel.jsx`
  - 移除現有的簡單 3 欄位表單
  - 改為顯示當前選擇的報表類型
  - 更新匯入/匯出功能支援兩種報表格式

### 3.3 新增 CSS 樣式
- [x] 修改 `src/App.css`
  - 新增 Accordion 區塊樣式
  - 新增表單欄位網格布局
  - 新增表格水平捲動樣式
  - 新增欄位凍結樣式

## 階段 4：測試與驗證 ✅

### 4.1 功能測試
- [x] 新增財務報表（所有 80+ 欄位）
- [x] 編輯財務報表
- [x] 刪除財務報表（含確認對話框）
- [x] 新增損益表（所有 26 欄位）
- [x] 編輯損益表
- [x] 刪除損益表
- [x] Tab 切換功能
- [x] 表格排序、篩選、分頁
- [x] Accordion 展開/摺疊

### 4.2 資料驗證
- [x] 使用 Supabase Dashboard 驗證資料正確寫入
- [x] 驗證 Upsert 邏輯（重複主鍵更新而非新增）
- [x] 驗證刪除功能（資料從資料庫移除）
- [x] 驗證表單驗證規則

### 4.3 E2E 測試
- [ ] 新增 Playwright 測試案例
  - 財務報表 CRUD 流程
  - 損益表 CRUD 流程
  - Tab 切換流程
  - Accordion 互動流程

### 4.4 錯誤處理測試
- [x] API 連線失敗時降級到 demo 模式
- [x] 表單驗證失敗顯示錯誤訊息
- [x] 刪除確認對話框正常運作（已修正 DeleteConfirmDialog 支援新欄位名稱）

## 依賴關係

```
階段 1 (後端 API)
    │
    ▼
階段 2 (前端元件) ← 階段 3.1 (狀態管理) 可並行
    │
    ▼
階段 3 (狀態整合)
    │
    ▼
階段 4 (測試驗證)
```

## 可並行執行的任務

- 階段 1.1 和 1.2 可並行（財務報表 API 和損益表 API）
- 階段 2.2 和 2.3 可並行（兩個表單組件）
- 階段 2.4、2.5、2.6 可並行（三個元件更新）

## 驗收標準

- [x] 所有 API 端點正常運作
- [x] Accordion 表單可正確展開/摺疊
- [x] 財務報表 80+ 欄位全部可編輯
- [x] 損益表 26 欄位全部可編輯
- [x] 表格支援水平捲動與欄位凍結
- [x] Tab 切換正常運作
- [x] CRUD 操作正確更新 Supabase 資料庫
- [ ] 所有 E2E 測試通過

---

## 已解決的 Bug

### DeleteConfirmDialog 空白畫面問題 (2025-02-02)
**問題**: 刪除資料時按下刪除按鈕後畫面空白

**原因**: `DeleteConfirmDialog.jsx` 使用舊的欄位名稱 (`record.company`, `record.year`)，但新資料結構使用 `company_name`, `fiscal_year`

**修正**:
```javascript
// src/components/DeleteConfirmDialog.jsx
<div><strong>公司:</strong> {record.company_name || record.company}</div>
<div><strong>年度:</strong> {record.fiscal_year || record.year}</div>
{record.revenue !== undefined && (
  <div><strong>營收:</strong> {record.revenue.toLocaleString()} 百萬元</div>
)}
{record.profit !== undefined && (
  <div><strong>淨利:</strong> {record.profit.toLocaleString()} 百萬元</div>
)}
```

---

## 測試資料

已建立以下測試資料：

| 公司 | 年度 | 財務報表 | 損益表 |
|------|------|----------|--------|
| 博弘雲端股份有限公司 | 2026 | ✅ (80+欄位) | ✅ (26欄位) |
| 遠傳電信股份有限公司 | 2025 | ✅ (80+欄位) | ✅ (26欄位) |

**稅籍編號參考**:
- 博弘雲端: 28497918
- 遠傳電信: 97179430
