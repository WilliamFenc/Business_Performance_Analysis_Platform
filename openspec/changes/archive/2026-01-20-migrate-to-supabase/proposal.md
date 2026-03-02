# Change: 將資料庫層從 Turso 遷移至 Supabase

## Why

目前平台使用 Turso SQLite 作為後端資料庫，但需要遷移至 Supabase PostgreSQL 以利用更強大的查詢能力和更好的雲端整合性。此次遷移需要處理資料表結構差異與數值單位轉換。

## What Changes

- **資料庫來源**: Turso SQLite → Supabase PostgreSQL
- **資料表對應**:
  - `companies.name` → `companies.company_name`
  - `financial_data` 表 → `pl_income_basics` 表
  - `financial_data.year` → `pl_income_basics.fiscal_year`
  - `financial_data.revenue` → `pl_income_basics.operating_revenue_total`
  - `financial_data.profit` → `pl_income_basics.profit_before_tax`
- **公司識別**: 使用 `company_name` 作為主要識別，內部使用 `tax_id` (統一編號) 進行查詢
- **數值單位轉換**: Supabase 資料為「千元」，需轉換為「百萬元」以維持前端顯示一致性
- **後端 API 更新**: 更新所有 Vercel Serverless Functions 以使用 Supabase 客戶端
- **相依性更新**: 移除 `@libsql/client`，新增 `@supabase/supabase-js`

## Impact

- 影響的 specs:
  - `data-layer` (新增)
- 影響的檔案:
  - `api/_lib.js` - 資料庫客戶端工廠函式
  - `api/companies.js` - 公司列表 API
  - `api/financial/all.js` - 所有財務數據 API
  - `api/financial/by-name.js` - 單一公司財務資料 API
  - `package.json` - 相依性調整

## 非功能性影響

- **單位轉換**: 所有從 Supabase 讀取的數值需除以 1000（千元 → 百萬元）
- **API 相容性**: 保持前端 API 介面不變，僅後端實作更動
- **降級模式**: 現有的 demo 模式功能保持不變

## 資料庫結構確認

**Turso companies 表**:
```
id: integer (PK)
name: text
created_at: timestamp
```

**Supabase companies 表**:
```
id: integer (PK, auto-increment)
tax_id: varchar (統一編號)
company_name: text
created_at: timestamp
updated_at: timestamp
```

**Supabase pl_income_basics 表** (財務資料來源):
```
fiscal_year: integer (年度)
tax_id: char(8) (統一編號, PK)
company_name: text
operating_revenue_total: numeric (營業收入合計, 單位:千元)
profit_before_tax: numeric (稅前淨利, 單位:千元)
```
