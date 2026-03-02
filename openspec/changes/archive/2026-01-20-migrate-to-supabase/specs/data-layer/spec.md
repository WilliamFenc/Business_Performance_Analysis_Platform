## ADDED Requirements

### Requirement: Supabase 資料庫連線

系統 SHALL 使用 Supabase 作為後端資料庫來源，取代原本的 Turso SQLite。

#### Scenario: 成功連線至 Supabase

- **WHEN** 後端 API 初始化
- **THEN** SHALL 使用 `@supabase/supabase-js` 建立客戶端連線
- **AND** SHALL 從環境變數讀取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`

#### Scenario: 連線失敗時降級

- **WHEN** Supabase 連線失敗
- **THEN** SHALL 降級至 demo 模式
- **AND** SHALL 顯示「博弘雲端」公司範例資料

### Requirement: 財務資料查詢與欄位對應

系統 SHALL 從 Supabase `pl_income_basics` 表查詢財務資料，並對應至原有欄位。

#### Scenario: 查詢所有財務資料

- **WHEN** 呼叫 `GET /api/financial/all`
- **THEN** SHALL 查詢 `pl_income_basics.operating_revenue_total`（對應原 `revenue`）
- **AND** SHALL 查詢 `pl_income_basics.profit_before_tax`（對應原 `profit`）
- **AND** SHALL 回傳格式包含 `company`, `year`, `revenue`, `profit`

#### Scenario: 查詢單一公司財務資料

- **WHEN** 呼叫 `GET /api/financial/by-name?company=xxx`
- **THEN** SHALL 查詢指定公司的 `pl_income_basics` 資料
- **AND** SHALL 回傳 `labels`, `revenue`, `profit` 陣列

### Requirement: 數值單位轉換

系統 SHALL 將 Supabase 的「千元」單位轉換為「百萬元」，以維持前端顯示一致性。

#### Scenario: 營收數值轉換

- **WHEN** 從 Supabase 讀取 `operating_revenue_total`
- **THEN** SHALL 將數值除以 1000
- **AND** SHALL 回傳轉換後的「百萬元」數值

#### Scenario: 淨利數值轉換

- **WHEN** 從 Supabase 讀取 `profit_before_tax`
- **THEN** SHALL 將數值除以 1000
- **AND** SHALL 回傳轉換後的「百萬元」數值

#### Scenario: 前端顯示單位

- **WHEN** 前端接收 API 回應
- **THEN** 顯示的數值單位 SHALL 維持為「百萬元」
- **AND** 前端代碼無需修改

### Requirement: 公司資料查詢

系統 SHALL 提供公司列表查詢功能。

#### Scenario: 查詢所有公司

- **WHEN** 呼叫 `GET /api/companies`
- **THEN** SHALL 回傳所有可用公司列表
- **AND** 每個公司包含 `id` 和 `name` 欄位
