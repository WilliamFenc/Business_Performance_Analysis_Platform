# data-layer Spec Delta

## ADDED Requirements

### Requirement: 多環境資料庫支援

系統 SHALL 支援根據環境變數自動切換資料庫來源，讓同一套程式碼可部署於不同環境使用不同資料庫。

#### Scenario: Vercel 部署使用 Supabase

- **WHEN** `DATABASE_TYPE` 環境變數設為 `supabase` 或未設定
- **THEN** 系統 SHALL 使用 Supabase 作為資料庫來源
- **AND** SHALL 使用 `@supabase/supabase-js` 建立連線
- **AND** SHALL 從 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 讀取連線資訊
- **AND** 前端頁面右下角 SHALL 顯示 `🟢 DB: Supabase`

#### Scenario: Jenkins 部署使用 SQL Server

- **WHEN** `DATABASE_TYPE` 環境變數設為 `sqlserver`
- **THEN** 系統 SHALL 使用 SQL Server 作為資料庫來源
- **AND** SHALL 使用 `mssql` 套件建立連線
- **AND** SHALL 從 `SQLSERVER_SERVER`, `SQLSERVER_DATABASE`, `SQLSERVER_USER`, `SQLSERVER_PASSWORD` 讀取連線資訊
- **AND** 前端頁面右下角 SHALL 顯示 `🟢 DB: SQL Server`

#### Scenario: 資料庫連線失敗時顯示錯誤狀態

- **WHEN** 資料庫連線失敗
- **THEN** 前端頁面右下角 SHALL 顯示 `🔴 DB: 連線失敗`
- **AND** SHALL 在 console 記錄錯誤訊息

#### Scenario: 資料庫狀態顯示元件

- **WHEN** 使用者開啟網頁
- **THEN** SHALL 在頁面右下角顯示資料庫連線狀態
- **AND** SHALL 透過 `GET /api/db-status` API 取得狀態
- **AND** 狀態文字 SHALL 包含資料庫型別 (Supabase/SQL Server)
- **AND** 顏色指示：綠色表示正常、紅色表示失敗
- **AND** 此功能 SHALL 在 UAT 完成後移除（暫時功能）

#### Scenario: 資料庫狀態 API 端點

- **WHEN** 呼叫 `GET /api/db-status`
- **THEN** SHALL 回傳資料庫連線狀態資訊
- **AND** 回傳格式 SHALL 包含：
  - `databaseType`: `"supabase"` 或 `"sqlserver"`
  - `status`: `"connected"` 或 `"failed"`
  - `message`: 狀態描述訊息
- **AND** 此 API 端點 SHALL 在 UAT 完成後移除（暫時功能）

#### Scenario: 資料庫適配器自動選擇

- **WHEN** 後端 API 初始化
- **THEN** SHALL 根據 `DATABASE_TYPE` 環境變數自動選擇對應的資料庫適配器
- **AND** API 端點程式碼不需要修改即可支援不同資料庫

### Requirement: SQL Server 資料庫連線

系統 SHALL 支援連接企業內部 SQL Server 資料庫，實作完整 CRUD 操作。

#### Scenario: 成功連線至 SQL Server

- **WHEN** `DATABASE_TYPE=sqlserver` 且 SQL Server 連線資訊正確
- **THEN** SHALL 使用 `mssql` 套件建立連線池
- **AND** SHALL 連接到指定的 SQL Server 實例
- **AND** 連線逾時時間 SHALL 預設為 30 秒

#### Scenario: SQL Server 查詢公司列表

- **WHEN** 呼叫 `GET /api/companies` 且 `DATABASE_TYPE=sqlserver`
- **THEN** SHALL 查詢 SQL Server `companies` 表
- **AND** SHALL 回傳 `id` 和 `name` 欄位
- **AND** 回傳格式 SHALL 與 Supabase 模式一致

#### Scenario: SQL Server UPSERT 操作

- **WHEN** 呼叫 `POST /api/financial-basics/` 且 `DATABASE_TYPE=sqlserver`
- **THEN** SHALL 使用 `MERGE` 語法進行 upsert
- **AND** SHALL 根據主鍵 `(fiscal_year, tax_id)` 判斷新增或更新
- **AND** SHALL 回傳與 Supabase 模式一致的 JSON 格式

#### Scenario: SQL Server 連線失敗時降級

- **WHEN** SQL Server 連線失敗
- **THEN** SHALL 降級至 demo 模式
- **AND** SHALL 顯示「博弘雲端」公司範例資料
- **AND** 錯誤訊息 SHALL 記錄於 console

### Requirement: 資料庫抽象層 Repository

系統 SHALL 提供統一的 Repository 介面，讓 API 端點透過一致的方式存取不同資料庫。

#### Scenario: Repository 建立與使用

- **WHEN** API 端點呼叫 `createRepository()`
- **THEN** SHALL 根據 `DATABASE_TYPE` 返回對應的 Repository 實例
- **AND** Repository SHALL 提供統一的方法介面

#### Scenario: 統一的 CRUD 介面

- **WHEN** 使用 Repository 實例
- **THEN** SHALL 提供以下方法：
  - `getCompanies()` - 取得公司列表
  - `getFinancialBasics(filters)` - 取得財務報表資料
  - `upsertFinancialBasics(data)` - 新增或更新財務報表
  - `updateFinancialBasics(taxId, year, data)` - 更新指定財務報表
  - `deleteFinancialBasics(taxId, year)` - 刪除指定財務報表
  - `getPlIncome(filters)` - 取得損益表資料
  - `upsertPlIncome(data)` - 新增或更新損益表
  - `updatePlIncome(taxId, year, data)` - 更新指定損益表
  - `deletePlIncome(taxId, year)` - 刪除指定損益表
  - `getFinancialDataByCompany(company)` - 取得指定公司財務資料
  - `getAllFinancialDataWithCompany()` - 取得所有財務資料與公司關聯

#### Scenario: API 端點使用 Repository

- **WHEN** API 端點需要存取資料庫
- **THEN** SHALL 呼叫 `await createRepository()` 取得 Repository 實例
- **AND** SHALL 使用 Repository 方法執行資料庫操作
- **AND** SHALL 不直接呼叫 Supabase SDK 或 mssql 套件

## MODIFIED Requirements

### Requirement: Supabase 資料庫連線

系統 SHALL 支援使用 Supabase 作為後端資料庫來源（Vercel 部署環境）。

#### Scenario: 成功連線至 Supabase

- **WHEN** `DATABASE_TYPE=supabase` 或未設定時，後端 API 初始化
- **THEN** SHALL 使用 Supabase Adapter 建立客戶端連線
- **AND** SHALL 從環境變數讀取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
- **AND** SHALL 透過 Repository 介面提供資料庫操作

#### Scenario: 連線失敗時降級

- **WHEN** Supabase 連線失敗
- **THEN** SHALL 降級至 demo 模式
- **AND** SHALL 顯示「博弘雲端」公司範例資料
- **AND** SHALL 記錄錯誤於 console

### Requirement: 財務資料查詢與欄位對應

系統 SHALL 擴展財務資料查詢，支援從 Supabase 或 SQL Server 查詢，同時保持向下相容。

#### Scenario: 查詢所有財務資料（更新）

- **WHEN** 呼叫 `GET /api/financial/all`
- **THEN** SHALL 根據 `DATABASE_TYPE` 從對應資料庫查詢
- **AND** SHALL 回傳簡化格式用於圖表顯示（保持向下相容）
- **AND** SHALL 包含 `company`, `year`, `revenue`, `profit` 欄位
- **AND** `revenue` SHALL 對應 `pl_income_basics.operating_revenue_total`
- **AND** `profit` SHALL 對應 `pl_income_basics.profit_before_tax`

### Requirement: 數值單位轉換

系統 SHALL 將資料庫的「千元」單位轉換為「百萬元」，以維持前端顯示一致性。

#### Scenario: 營收數值轉換

- **WHEN** 從資料庫讀取 `operating_revenue_total`
- **THEN** SHALL 將數值除以 1000
- **AND** SHALL 回傳轉換後的「百萬元」數值
- **AND** 轉換邏輯 SHALL 在 Adapter 層統一處理

#### Scenario: 淨利數值轉換

- **WHEN** 從資料庫讀取 `profit_before_tax`
- **THEN** SHALL 將數值除以 1000
- **AND** SHALL 回傳轉換後的「百萬元」數值
- **AND** 轉換邏輯 SHALL 在 Adapter 層統一處理

### Requirement: 公司資料查詢

系統 SHALL 提供公司列表查詢功能，支援 Supabase 和 SQL Server。

#### Scenario: 查詢所有公司

- **WHEN** 呼叫 `GET /api/companies`
- **THEN** SHALL 根據 `DATABASE_TYPE` 從對應資料庫查詢
- **AND** SHALL 回傳所有可用公司列表
- **AND** 每個公司包含 `id` 和 `name` 欄位

### Requirement: 財務報表 CRUD API

系統 SHALL 提供完整的財務報表（financial_basics）CRUD API 端點，支援 Supabase 和 SQL Server。

#### Scenario: 取得所有財務報表資料

- **WHEN** 呼叫 `GET /api/financial-basics/`
- **THEN** SHALL 根據 `DATABASE_TYPE` 查詢對應資料庫的 `financial_basics` 表
- **AND** SHALL 回傳所有欄位的資料（包含 80+ 欄位）
- **AND** SHALL 回傳 JSON 格式陣列

#### Scenario: 新增或更新財務報表資料

- **WHEN** 呼叫 `POST /api/financial-basics/`
- **AND** 提供包含 `fiscal_year`, `tax_id` 及其他欄位的資料
- **THEN** SHALL 根據資料庫型別執行對應的 upsert 操作
  - Supabase: 使用 `INSERT ... ON CONFLICT DO UPDATE`
  - SQL Server: 使用 `MERGE` 語法
- **AND** SHALL 根據主鍵 `(fiscal_year, tax_id)` 判斷新增或更新
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 更新指定財務報表資料

- **WHEN** 呼叫 `PUT /api/financial-basics/{taxId}/{year}/`
- **AND** 提供要更新的欄位資料
- **THEN** SHALL 根據資料庫型別執行對應的更新操作
- **AND** SHALL 更新指定 `tax_id` 和 `fiscal_year` 的記錄
- **AND** SHALL 只更新提供的欄位（部分更新）
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 刪除指定財務報表資料

- **WHEN** 呼叫 `DELETE /api/financial-basics/{taxId}/{year}/`
- **THEN** SHALL 根據資料庫型別執行對應的刪除操作
- **AND** SHALL 刪除指定 `tax_id` 和 `fiscal_year` 的記錄
- **AND** SHALL 回傳 `success: true` 或 `success: false`

### Requirement: 損益表 CRUD API

系統 SHALL 提供完整的損益表（pl_income_basics）CRUD API 端點，支援 Supabase 和 SQL Server。

#### Scenario: 取得所有損益表資料

- **WHEN** 呼叫 `GET /api/pl-income/`
- **THEN** SHALL 根據 `DATABASE_TYPE` 查詢對應資料庫的 `pl_income_basics` 表
- **AND** SHALL 回傳所有欄位的資料（包含 26 欄位）
- **AND** SHALL 回傳 JSON 格式陣列

#### Scenario: 新增或更新損益表資料

- **WHEN** 呼叫 `POST /api/pl-income/`
- **AND** 提供包含 `fiscal_year`, `tax_id` 及其他欄位的資料
- **THEN** SHALL 根據資料庫型別執行對應的 upsert 操作
- **AND** SHALL 根據主鍵 `(fiscal_year, tax_id)` 判斷新增或更新
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 更新指定損益表資料

- **WHEN** 呼叫 `PUT /api/pl-income/{taxId}/{year}/`
- **AND** 提供要更新的欄位資料
- **THEN** SHALL 根據資料庫型別執行對應的更新操作
- **AND** SHALL 更新指定 `tax_id` 和 `fiscal_year` 的記錄
- **AND** SHALL 只更新提供的欄位（部分更新）
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 刪除指定損益表資料

- **WHEN** 呼叫 `DELETE /api/pl-income/{taxId}/{year}/`
- **THEN** SHALL 根據資料庫型別執行對應的刪除操作
- **AND** SHALL 刪除指定 `tax_id` 和 `fiscal_year` 的記錄
- **AND** SHALL 回傳 `success: true` 或 `success: false`
