# SQL Server 資料庫規格文件

## 1. 連線資訊

| 項目 | 值 |
|------|-----|
| **伺服器位址** | `10.2.15.137` |
| **連接埠** | `1433` |
| **資料庫名稱** | `agent_finance` |
| **使用者名稱** | `ga_2_1` |
| **驗證方式** | SQL Server 驗證 |


---

## 2. 資料庫概覽

| 資料表名稱 | 說明 |
|-----------|------|
| `companies` | 公司基本資料表 |
| `financial_basics` | 財務基本資料表（資產負債表項目） |
| `pl_income_basics` | 損益表基本資料表 |

---

## 3. 資料表 Schema

### 3.1 companies - 公司基本資料表

儲存公司基本資訊。

| 欄位名稱 | 資料型別 | 長度 | 可空 | 預設值 | 說明 |
|----------|----------|------|------|--------|------|
| `id` | `int` | - | NOT NULL | - | 主鍵，公司唯一識別碼 |
| `tax_id` | `nvarchar` | 50 | NOT NULL | - | 統一編號 |
| `company_name` | `nvarchar` | 255 | NOT NULL | - | 公司名稱 |
| `created_at` | `datetime` | - | NULL | - | 建立時間 |
| `updated_at` | `datetime` | - | NULL | - | 更新時間 |

**主鍵:** `id`

**查詢範例:**
```sql
-- 查詢所有公司
SELECT * FROM companies;

-- 根據統一編號查詢
SELECT * FROM companies WHERE tax_id = '28497918';
```

---

### 3.2 financial_basics - 財務基本資料表

儲存公司資產負債表財務資料。

| 欄位名稱 | 資料型別 | 可空 | 說明 |
|----------|----------|------|------|
| `fiscal_year` | `int` | NOT NULL | 會計年度 |
| `tax_id` | `nvarchar(50)` | NOT NULL | 統一編號 |
| `company_name` | `nvarchar(255)` | NULL | 公司名稱 |
| `account_item` | `nvarchar(255)` | NULL | 會計項目代碼及簡稱 |

#### 資產項目 (Assets)

| 欄位名稱 | 說明 |
|----------|------|
| `cash_equivalents` | 現金及約當現金 |
| `fvtpl_assets_current` | 透過損益按公允價值衡量之流動金融資產 |
| `fvoci_assets_current` | 透過其他綜合損益按公允價值衡量之流動金融資產 |
| `amortized_assets_current` | 攤銷後成本法之流動金融資產 |
| `hedging_assets_current` | 流動避險資產 |
| `contract_assets_current` | 流動合約資產 |
| `notes_receivable_net` | 應收票據淨額 |
| `ar_net` | 應收帳款淨額 |
| `ar_related_net` | 應收關係人款項淨額 |
| `other_receivables_net` | 其他應收款淨額 |
| `current_tax_assets` | 流動所得稅資產 |
| `inventory` | 存貨 |
| `prepayments` | 預付款項 |
| `assets_held_for_sale_net` | 待出售非流動資產淨額 |
| `other_fin_assets_current` | 其他流動金融資產 |
| `other_current_assets` | 其他流動資產 |
| `total_current_assets` | 流動資產合計 |
| `fvtpl_assets_noncurrent` | 透過損益按公允價值衡量之非流動金融資產 |
| `fvoci_assets_noncurrent` | 透過其他綜合損益按公允價值衡量之非流動金融資產 |
| `amortized_assets_noncurrent` | 攤銷後成本法之非流動金融資產 |
| `contract_assets_noncurrent` | 非流動合約資產 |
| `equity_method_investments` | 採權益法評價之投資 |
| `ppe` | 不動產、廠房及設備 |
| `right_of_use_assets` | 使用權資產 |
| `investment_properties_net` | 投資性不動產淨額 |
| `intangible_assets` | 無形資產 |
| `deferred_tax_assets` | 遞延所得稅資產 |
| `other_noncurrent_assets` | 其他非流動資產 |
| `total_noncurrent_assets` | 非流動資產合計 |
| `total_assets` | 資產總計 |

#### 負債項目 (Liabilities)

| 欄位名稱 | 說明 |
|----------|------|
| `prepayments_for_equip` | 購置設備預付款 |
| `guarantee_deposits_out` | 存出保證金 |
| `short_term_borrowings` | 短期借款 |
| `short_term_notes_payable` | 應付短期票券 |
| `financial_liabilities_at_fair_value_through_profit_or_loss_curr` | 透過損益按公允價值衡量之流動金融負債 |
| `hedging_liabilities_current` | 流動避險負債 |
| `contract_liabilities_current` | 流動合約負債 |
| `notes_payable` | 應付票據 |
| `ap` | 應付帳款 |
| `ap_related` | 應付關係人款項 |
| `other_payables` | 其他應付款 |
| `income_tax_payable` | 應付所得稅 |
| `provisions_current` | 流動負債準備 |
| `lease_liabilities_current` | 流動租賃負債 |
| `other_current_liabilities` | 其他流動負債 |
| `total_current_liabilities` | 流動負債合計 |
| `contract_liabilities_noncurrent` | 非流動合約負債 |
| `bonds_payable` | 應付公司債 |
| `long_term_borrowings` | 長期借款 |
| `provisions_noncurrent` | 非流動負債準備 |
| `deferred_tax_liabilities` | 遞延所得稅負債 |
| `lease_liabilities_noncurrent` | 非流動租賃負債 |
| `other_noncurrent_liabilities` | 其他非流動負債 |
| `total_noncurrent_liabilities` | 非流動負債合計 |
| `guarantee_deposits_in` | 存入保證金 |
| `total_liabilities` | 負債合計 |

#### 權益項目 (Equity)

| 欄位名稱 | 說明 |
|----------|------|
| `common_stock` | 普通股股本 |
| `total_capital_stock` | 股本合計 |
| `capital_reserves` | 資本公積 |
| `legal_reserves` | 法定盈餘公積 |
| `special_reserves` | 特別盈餘公積 |
| `retained_earnings_unappropriated` | 未分配盈餘 |
| `total_retained_earnings` | 盈餘公積合計 |
| `other_equity` | 其他權益 |
| `treasury_stock` | 庫藏股票 |
| `equity_attr_parent` | 歸屬於母公司業主之權益 |
| `nci` | 非控制權益 |
| `total_equity` | 權益合計 |
| `liabilities_equity_total` | 負債及權益總計 |

#### 股本相關

| 欄位名稱 | 資料型別 | 說明 |
|----------|----------|------|
| `shares_to_be_cancelled` | `bigint` | 待註銷股數 |
| `advance_receipts_shares` | `bigint` | 頄收股款股數 |
| `treasury_shares_held` | `bigint` | 庫藏股股數 |

**查詢範例:**
```sql
-- 查詢特定年度所有公司的財務資料
SELECT * FROM financial_basics WHERE fiscal_year = 2024;

-- 查詢特定公司的財務資料
SELECT * FROM financial_basics WHERE tax_id = '28497918' ORDER BY fiscal_year;

-- 計算流動比率
SELECT
    company_name,
    fiscal_year,
    total_current_assets,
    total_current_liabilities,
    CAST(total_current_assets AS FLOAT) / NULLIF(CAST(total_current_liabilities AS FLOAT), 0) AS current_ratio
FROM financial_basics
WHERE fiscal_year = 2024;
```

---

### 3.3 pl_income_basics - 損益表基本資料表

儲存公司損益表財務資料。

| 欄位名稱 | 資料型別 | 可空 | 說明 |
|----------|----------|------|------|
| `fiscal_year` | `int` | NOT NULL | 會計年度 |
| `tax_id` | `nvarchar(50)` | NOT NULL | 統一編號 |
| `company_name` | `nvarchar(255)` | NOT NULL | 公司名稱 |
| `account_item` | `nvarchar(255)` | NULL | 會計項目代碼及簡稱 |

#### 損益項目

| 欄位名稱 | 說明 |
|----------|------|
| `operating_revenue_total` | 營業收入合計 |
| `operating_costs_total` | 營業成本合計 |
| `gross_profit_loss` | 毛利（損） |
| `gross_profit_loss_net` | 毛利（損）淨額 |
| `selling_expenses` | 銷售費用 |
| `general_admin_expenses` | 管理費用 |
| `r_and_d_expenses` | 研究發展費用 |
| `expected_credit_loss_net` | 預期信用損失淨額 |
| `operating_expenses_total` | 營業費用合計 |
| `other_income_expense_net` | 其他收益及損失淨額 |
| `operating_income_loss` | 營業利益（損失） |
| `interest_income` | 利息收入 |
| `other_income` | 其他收入 |
| `other_gains_losses_net` | 其他利益及損失淨額 |
| `finance_costs_net` | 財務成本淨額 |
| `equity_method_share_net` | 採權益法認列之投資淨益（損） |
| `nonop_income_expense_total` | 營業外收入及支出合計 |
| `profit_before_tax` | 稅前淨利（損） |
| `income_tax_expense_total` | 所得稅費用（利益）合計 |
| `net_income_cont_ops` | 繼續營業單位本期淨利（損） |
| `net_income` | 本期淨利（損） |

**查詢範例:**
```sql
-- 查詢特定年度所有公司的損益資料
SELECT * FROM pl_income_basics WHERE fiscal_year = 2024;

-- 計算毛利率
SELECT
    company_name,
    fiscal_year,
    operating_revenue_total,
    gross_profit_loss,
    CAST(gross_profit_loss AS FLOAT) / NULLIF(CAST(operating_revenue_total AS FLOAT), 0) * 100 AS gross_margin_pct
FROM pl_income_basics
WHERE fiscal_year = 2024
ORDER BY gross_margin_pct DESC;

-- 結合資產負債表與損益表
SELECT
    fb.company_name,
    fb.fiscal_year,
    fb.total_assets,
    pl.net_income,
    CAST(pl.net_income AS FLOAT) / NULLIF(CAST(fb.total_assets AS FLOAT), 0) * 100 AS roa_pct
FROM financial_basics fb
INNER JOIN pl_income_basics pl
    ON fb.tax_id = pl.tax_id AND fb.fiscal_year = pl.fiscal_year
WHERE fb.fiscal_year = 2024;
```

---

## 4. 資料關聯圖

```
┌─────────────────┐
│    companies    │
│  (公司基本資料)  │
├─────────────────┤
│ id (PK)         │
│ tax_id          │◄────┐
│ company_name    │     │
│ created_at      │     │
│ updated_at      │     │
└─────────────────┘     │
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   financial_basics      │   │    pl_income_basics     │
│   (資產負債表)           │   │    (損益表)              │
├─────────────────────────┤   ├─────────────────────────┤
│ fiscal_year             │   │ fiscal_year             │
│ tax_id (FK)             │   │ tax_id (FK)             │
│ company_name            │   │ company_name            │
│ [資產項目...]           │   │ [損益項目...]           │
│ [負債項目...]           │   │                         │
│ [權益項目...]           │   │                         │
└─────────────────────────┘   └─────────────────────────┘
```

**關聯說明:**
- `financial_basics.tax_id` → `companies.tax_id` (統一編號關聯)
- `pl_income_basics.tax_id` → `companies.tax_id` (統一編號關聯)
- `financial_basics` 與 `pl_income_basics` 可透過 `tax_id` + `fiscal_year` 進行關聯

---

## 5. 常用查詢範例

### 5.1 查詢公司完整財務報表

```sql
SELECT
    c.company_name,
    c.tax_id,
    fb.fiscal_year,
    fb.total_assets AS 資產總額,
    fb.total_liabilities AS 負債總額,
    fb.total_equity AS 權益總額,
    pl.operating_revenue_total AS 營業收入,
    pl.gross_profit_loss AS 毛利,
    pl.operating_income_loss AS 營業利益,
    pl.net_income AS 淨利
FROM companies c
LEFT JOIN financial_basics fb ON c.tax_id = fb.tax_id
LEFT JOIN pl_income_basics pl ON c.tax_id = pl.tax_id AND fb.fiscal_year = pl.fiscal_year
WHERE fb.fiscal_year = 2024
ORDER BY c.company_name;
```

### 5.2 計算財務比率

```sql
SELECT
    company_name,
    fiscal_year,
    -- 流動比率
    CAST(total_current_assets AS FLOAT) / NULLIF(CAST(total_current_liabilities AS FLOAT), 0) AS 流動比率,
    -- 負債比率
    CAST(total_liabilities AS FLOAT) / NULLIF(CAST(total_assets AS FLOAT), 0) AS 負債比率,
    -- 權益比率
    CAST(total_equity AS FLOAT) / NULLIF(CAST(total_assets AS FLOAT), 0) AS 權益比率
FROM financial_basics
WHERE fiscal_year = 2024
ORDER BY company_name;
```

### 5.3 多年度營收成長率比較

```sql
WITH YearlyRevenue AS (
    SELECT
        company_name,
        fiscal_year,
        operating_revenue_total,
        LAG(operating_revenue_total) OVER (PARTITION BY tax_id ORDER BY fiscal_year) AS prev_revenue
    FROM pl_income_basics
)
SELECT
    company_name,
    fiscal_year,
    operating_revenue_total,
    prev_revenue,
    CASE
        WHEN prev_revenue IS NOT NULL AND prev_revenue <> 0
        THEN CAST((operating_revenue_total - prev_revenue) AS FLOAT) / prev_revenue * 100
        ELSE NULL
    END AS growth_rate_pct
FROM YearlyRevenue
ORDER BY company_name, fiscal_year;
```

---

**文件版本:** 1.0
**更新日期:** 2025-01-30
