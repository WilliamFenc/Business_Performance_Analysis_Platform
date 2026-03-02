# excel-import-export Specification

## Purpose
TBD - created by archiving change 2026-02-02-import-export-excel. Update Purpose after archive.
## Requirements
### Requirement: Excel 匯入功能

系統 SHALL 支援透過 Excel 檔案批次匯入財務資料。

#### Scenario: 使用者透過 Excel 批次匯入財務資料
- Given 使用者在「數據與檔案管理」頁面
- And 系統已有 financial_basics 和 pl_income_basics 資料表
- When 使用者點擊「📥 從 Excel 匯入」按鈕
- And 選擇包含「財務報表」和「損益表」Sheet 的 .xlsx 檔案
- And 檔案格式符合雙列標題規範（第1列中文、第2列英文）
- Then 系統 MUST 解析 Excel 檔案並顯示匯入預覽
- And 預覽 MUST 顯示將新增/更新的筆數
- When 使用者確認匯入
- Then 系統 MUST 執行批次 Upsert（以 fiscal_year + tax_id 為 PK）
- And 匯入完成後 MUST 顯示成功/失敗統計
- And 1.5 秒後系統 SHALL 自動重新整理頁面載入最新資料

### Requirement: 欄位對應機制

系統 MUST 使用雙重規則進行 Excel 欄位對應。

#### Scenario: 欄位對應使用雙重規則
- Given Excel 檔案包含雙列標題（第1列中文、第2列英文）
- When 系統執行欄位對應
- Then 系統 MUST 優先使用第2列英文名稱對應 Supabase column_name
- And 若英文名稱無法對應，系統 MUST 使用第1列中文名稱對應 column_description
- And 系統 SHALL 記錄無法對應的欄位為警告

### Requirement: 中文字串編碼

系統 MUST 正確處理 Excel 中的中文字串。

#### Scenario: 中文字串正確編碼
- Given Excel 檔案包含中文公司名稱和會計科目
- When 系統使用 XLSX.js 解析檔案
- Then 系統 MUST 使用 `raw: false` 和 `defval: null` 選項
- And company_name 和 account_item MUST 正確顯示中文（無亂碼）

### Requirement: Excel 匯出功能

系統 SHALL 支援將財務資料匯出為 Excel 檔案。

#### Scenario: 使用者匯出財務資料為 Excel
- Given 使用者在「數據與檔案管理」頁面
- And 系統中有 financial_basics 和 pl_income_basics 資料
- When 使用者點擊「📤 匯出 Excel」按鈕
- Then 系統 MUST 生成包含兩個 Sheet 的 Excel 檔案
- And Sheet1 MUST 命名為「財務報表」，包含 financial_basics 資料
- And Sheet2 MUST 命名為「損益表」，包含 pl_income_basics 資料
- And 每個 Sheet MUST 包含雙列標題（第1列中文、第2列英文）
- And 檔案命名格式 SHALL 為 `財務資料_YYYYMMDD_HHMMSS.xlsx`

### Requirement: 批次匯入 API

系統 MUST 提供批次匯入 API 端點。

#### Scenario: 批次匯入 API
- Given 後端收到 POST /api/financial-basics/batch-import 請求
- And Request body 包含 records 陣列
- When 系統處理每筆記錄
- Then 系統 MUST 驗證 fiscal_year 和 tax_id 必要欄位
- And 系統 MUST 檢查 PK 是否存在以判斷 INSERT 或 UPDATE
- And 系統 MUST 執行 Supabase upsert 操作
- And 系統 MUST 回傳 inserted/updated/skipped/errors 統計

### Requirement: 匯出 API

系統 MUST 提供匯出 API 端點。

#### Scenario: 匯出 API
- Given 後端收到 GET /api/financial-basics/export 請求
- And 可能包含 taxId 或 fiscalYear 篩選參數
- When 系統處理匯出
- Then 系統 MUST 查詢 financial_basics 和 pl_income_basics 資料
- And 系統 MUST 使用 ExcelJS 生成雙 Sheet Excel 檔案
- And 系統 MUST 回傳 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet 格式

### Requirement: DataManagerTabs 組件

系統 SHALL 在數據管理區塊顯示匯入/匯出按鈕。

#### Scenario: 顯示匯入/匯出按鈕
- Given 使用者檢視「數據與檔案管理」區塊
- Then Tab 列右側 MUST 顯示「📥 從 Excel 匯入」按鈕
- And Tab 列右側 MUST 顯示「📤 匯出 Excel」按鈕

