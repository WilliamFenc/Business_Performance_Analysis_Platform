# data-layer Spec Delta

## ADDED Requirements

### Requirement: 財務報表 CRUD API

系統 SHALL 提供完整的財務報表（financial_basics）CRUD API 端點。

#### Scenario: 取得所有財務報表資料

- **WHEN** 呼叫 `GET /api/financial-basics/`
- **THEN** SHALL 查詢 Supabase `financial_basics` 表
- **AND** SHALL 回傳所有欄位的資料（包含 80+ 欄位）
- **AND** SHALL 回傳 JSON 格式陣列

#### Scenario: 新增或更新財務報表資料

- **WHEN** 呼叫 `POST /api/financial-basics/`
- **AND** 提供包含 `fiscal_year`, `tax_id` 及其他欄位的資料
- **THEN** SHALL 使用 `INSERT ... ON CONFLICT DO UPDATE` 進行 upsert
- **AND** SHALL 根據主鍵 `(fiscal_year, tax_id)` 判斷新增或更新
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 更新指定財務報表資料

- **WHEN** 呼叫 `PUT /api/financial-basics/{taxId}/{year}/`
- **AND** 提供要更新的欄位資料
- **THEN** SHALL 更新指定 `tax_id` 和 `fiscal_year` 的記錄
- **AND** SHALL 只更新提供的欄位（部分更新）
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 刪除指定財務報表資料

- **WHEN** 呼叫 `DELETE /api/financial-basics/{taxId}/{year}/`
- **THEN** SHALL 刪除指定 `tax_id` 和 `fiscal_year` 的記錄
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 財務報表 API 錯誤處理

- **WHEN** API 連線失敗或查詢錯誤
- **THEN** SHALL 回傳 `success: false`
- **AND** SHALL 包含 `error` 訊息說明原因

### Requirement: 損益表 CRUD API

系統 SHALL 提供完整的損益表（pl_income_basics）CRUD API 端點。

#### Scenario: 取得所有損益表資料

- **WHEN** 呼叫 `GET /api/pl-income/`
- **THEN** SHALL 查詢 Supabase `pl_income_basics` 表
- **AND** SHALL 回傳所有欄位的資料（包含 26 欄位）
- **AND** SHALL 回傳 JSON 格式陣列

#### Scenario: 新增或更新損益表資料

- **WHEN** 呼叫 `POST /api/pl-income/`
- **AND** 提供包含 `fiscal_year`, `tax_id` 及其他欄位的資料
- **THEN** SHALL 使用 `INSERT ... ON CONFLICT DO UPDATE` 進行 upsert
- **AND** SHALL 根據主鍵 `(fiscal_year, tax_id)` 判斷新增或更新
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 更新指定損益表資料

- **WHEN** 呼叫 `PUT /api/pl-income/{taxId}/{year}/`
- **AND** 提供要更新的欄位資料
- **THEN** SHALL 更新指定 `tax_id` 和 `fiscal_year` 的記錄
- **AND** SHALL 只更新提供的欄位（部分更新）
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 刪除指定損益表資料

- **WHEN** 呼叫 `DELETE /api/pl-income/{taxId}/{year}/`
- **THEN** SHALL 刪除指定 `tax_id` 和 `fiscal_year` 的記錄
- **AND** SHALL 回傳 `success: true` 或 `success: false`

#### Scenario: 損益表 API 錯誤處理

- **WHEN** API 連線失敗或查詢錯誤
- **THEN** SHALL 回傳 `success: false`
- **AND** SHALL 包含 `error` 訊息說明原因

## MODIFIED Requirements

### Requirement: 財務資料查詢與欄位對應

系統 SHALL 擴展財務資料查詢，支援完整欄位查詢同時保持向下相容。

#### Scenario: 查詢所有財務資料（更新）

- **WHEN** 呼叫 `GET /api/financial/all`
- **THEN** SHALL 同時查詢 `financial_basics` 和 `pl_income_basics` 表
- **AND** SHALL 回傳簡化格式用於圖表顯示（保持向下相容）
- **AND** SHALL 包含 `company`, `year`, `revenue`, `profit` 欄位
- **AND** `revenue` SHALL 對應 `pl_income_basics.operating_revenue_total`
- **AND** `profit` SHALL 對應 `pl_income_basics.profit_before_tax`

## DELETED Requirements

無。
