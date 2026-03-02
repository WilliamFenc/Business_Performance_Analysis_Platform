# Design: Turso to Supabase Migration

## Context

目前平台使用 Turso SQLite 作為後端資料庫。由於業務需求，需要遷移至 Supabase PostgreSQL。

**資料來源差異**:

| 項目 | Turso (SQLite) | Supabase (PostgreSQL) |
|------|----------------|----------------------|
| 公司表 | `companies` | `companies` |
| 公司主鍵 | `id` (integer) | `id` (integer, auto-increment) |
| 公司名稱欄位 | `name` | `company_name` |
| 公司唯一識別 | `id` | `tax_id` (統一編號, varchar) |
| 財務表 | `financial_data` | `pl_income_basics` |
| 年份欄位 | `year` | `fiscal_year` |
| 公司關聯 | `company_id` (FK) | `tax_id` (統一編號) |
| 營收欄位 | `revenue` | `operating_revenue_total` |
| 淨利欄位 | `profit` | `profit_before_tax` |
| 數值單位 | 百萬元 | 千元 |

**實際資料範例 (博弘雲端)**:

| 年份 | Turso revenue | Supabase operating_revenue_total | 轉換後 |
|------|----------------|----------------------------------|--------|
| 2021 | 3510 (百萬) | 3510759 (千元) | 3510.759 ≈ 3510 |
| 2022 | 5061 (百萬) | 5061879 (千元) | 5061.879 ≈ 5061 |
| 2023 | 4749 (百萬) | 4748542 (千元) | 4748.542 ≈ 4749 |

## Goals / Non-Goals

**Goals**:
- 將所有後端 API 從 Turso 遷移至 Supabase
- 確保前端顯示單位維持「百萬元」
- 保持現有 API 介面相容性
- 維持 demo 模式降級機制

**Non-Goals**:
- 修改前端組件或顯示邏輯
- 變更 API 回應格式
- 資料庫 Schema 遷移工具（僅讀取，不需遷移資料）

## Decisions

### 1. 資料庫客戶端

**決策**: 使用 `@supabase/supabase-js` 作為客戶端

**理由**:
- 官方維護的 Supabase JavaScript 客戶端
- 支援 Vercel Serverless Functions
- 內建連線池管理

### 2. 單位轉換位置

**決策**: 在後端 API 層進行單位轉換

**理由**:
- 前端無需修改任何代碼
- API 回應格式保持一致
- 轉換邏輯集中管理

**實作方式**:
```javascript
// 千元 → 百萬元
function convertToMillions(valueInThousands) {
  // Supabase 回傳的字串需先轉為數值
  const numValue = typeof valueInThousands === 'string'
    ? parseFloat(valueInThousands)
    : valueInThousands;
  return numValue / 1000;
}
```

### 3. 公司資料查詢

**決策**: 使用 Supabase `companies` 表，並進行欄位對應

**欄位對應**:
- Turso: `id`, `name`
- Supabase: `id`, `company_name`

**API 回應格式保持不變**:
```javascript
{
  "companies": [
    { "id": 1, "name": "博弘雲端" },
    { "id": 2, "name": "遠傳電信" }
  ]
}
```

### 4. 公司識別方式

**決策**: 使用 `company_name` 作為主要識別，內部使用 `tax_id` 進行 Supabase 查詢

**理由**:
- 前端原本就使用公司名稱作為選擇器
- `tax_id` 僅作為 Supabase 查詢條件
- 簡化遷移複雜度

## Risks / Trade-offs

| 風險 | 緩解措施 |
|------|----------|
| Supabase 連線延遲 | 使用 Supabase Edge Runtime，連線位置靠近 Vercel |
| 環境變數設定錯誤 | API 失敗時自動降級至 demo 模式 |
| 單位轉換誤差 | 除以 1000 為精確轉換，無浮點數誤差 |
| 公司名稱不一致 | 使用 `tax_id` 作為可靠關聯鍵 |
| Supabase numeric 回傳字串 | 在轉換函式中處理型別轉換 |

## Migration Plan

### 步驟

1. **階段一**: 安裝相依性，建立 `getSupabaseClient()` 工廠函式
2. **階段二**: 逐個更新 API 端點
3. **階段三**: 驗證所有端點，移除 Turso 相關代碼
4. **階段四**: 部署至 Vercel，設定環境變數

### Rollback

若遷移失敗：
1. 在 Vercel 恢復 `TURSO_DATABASE_URL` 和 `TURSO_AUTH_TOKEN`
2. 重新部署上一版程式碼
3. API 將自動回退至 Turso 連線

## Database Queries

### Companies List
```sql
-- Turso
SELECT id, name FROM companies ORDER BY name;

-- Supabase
SELECT id, company_name as name FROM companies ORDER BY company_name;
```

### Financial Data by Company
```sql
-- Turso
SELECT fd.year, fd.revenue, fd.profit
FROM financial_data fd
JOIN companies c ON c.id = fd.company_id
WHERE c.name = ?
ORDER BY fd.year;

-- Supabase
SELECT fiscal_year as year,
       operating_revenue_total / 1000 as revenue,
       profit_before_tax / 1000 as profit
FROM pl_income_basics
WHERE company_name = ?
ORDER BY fiscal_year;
```

### All Financial Data
```sql
-- Turso
SELECT fd.company_id, c.name as company, fd.year, fd.revenue, fd.profit
FROM financial_data fd
JOIN companies c ON c.id = fd.company_id;

-- Supabase
SELECT c.id as company_id,
       p.company_name as company,
       p.fiscal_year as year,
       p.operating_revenue_total / 1000 as revenue,
       p.profit_before_tax / 1000 as profit
FROM pl_income_basics p
JOIN companies c ON c.tax_id = p.tax_id;
```
