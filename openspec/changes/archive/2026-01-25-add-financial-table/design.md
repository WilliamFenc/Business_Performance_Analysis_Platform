# Design: 詳細財務數據表

## Architecture Overview

### Component Structure

```
HomePage
├── CompanySelector
├── StatCards
├── InsightPanel
├── FinanceChart
├── FinancialDataTable (NEW)
│   ├── 表頭（15 欄位）
│   ├── 表身（年度列 × 指標欄）
│   └── 滾動容器（響應式）
├── DataManagerTabs
└── ...其他組件
```

## Data Flow

### Frontend → Backend

```
HomePage
  ↓ GET /api/financial/basics?company={name}
FinancialBasicsAPI
  ↓ 查詢 Supabase
  ├─ pl_income_basics (損益表)
  └─ financial_basics (資產負債表)
  ↓ 計算 14 個指標
  ↓ 回傳 JSON
FinancialDataTable
  ↓ 渲染表格
```

## API Design

### New Endpoint: GET /api/financial/basics

**Request Query Parameters:**
- `company` (string): 公司名稱

**Response Format:**
```json
{
  "success": true,
  "data": {
    "company": "博弘雲端",
    "years": [2020, 2021, 2022, 2023, 2024],
    "metrics": {
      "years": ["2020", "2021", "2022", "2023", "2024"],
      "netProfitMargin": [2.39, 2.37, 1.56, 2.55, 4.02],
      "grossMargin": [10.19, 9.11, 8.03, 8.88, 12.33],
      "roa": [null, null, null, null, null],
      "currentRatio": [121.07, 118.49, 119.76, 130.89, 186.05],
      "quickRatio": [115.45, 112.81, 112.83, 123.96, 178.34],
      "debtEquityRatio": [51.72, 57.35, 83.32, 60.42, 65.55],
      "arTurnover": [null, null, null, null, null],
      "inventoryTurnover": [null, null, null, null, null],
      "revenueGrowth": [null, 69.93, 44.15, -6.17, -15.73],
      "grossProfitGrowth": [null, 51.82, 27.05, 3.67, 17.13],
      "profitBeforeTaxGrowth": [null, 68.13, -4.72, 52.96, 33.05],
      "sellingExpenseRatio": [5.75, 4.29, 3.66, 3.74, 5.10],
      "adminExpenseRatio": [1.77, 1.39, 1.44, 2.19, 2.79],
      "rdExpenseRatio": [0.26, 0.22, 0.30, 0.37, 0.62]
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "公司資料不存在"
}
```

## Calculation Formulas

### 指標計算公式（Supabase 欄位對應）

| 指標 | 公式 | Supabase 來源欄位 |
|------|------|-------------------|
| 淨利率 | `profit_before_tax / operating_revenue_total * 100` | `pl_income_basics` |
| 毛利率 | `gross_profit_loss / operating_revenue_total * 100` | `pl_income_basics` |
| ROA | `net_income / ((total_assets + prev_total_assets) / 2) * 100` | `pl_income_basics`, `financial_basics` |
| 流動比率 | `total_current_assets / total_current_liabilities * 100` | `financial_basics` |
| 速動比率 | `(total_current_assets - inventory - prepayments) / total_current_liabilities * 100` | `financial_basics` |
| 負債淨值比 | `total_liabilities / total_equity * 100` | `financial_basics` |
| 應收帳款週轉率 | `operating_revenue_total / ((notes_receivable_net + ar_net + ar_related_net + prev_sum) / 2)` | 兩表綜合 |
| 存貨周轉率 | `operating_costs_total / ((inventory + prev_inventory) / 2)` | 兩表綜合 |
| 營收成長率 | `(operating_revenue_total / prev_operating_revenue_total - 1) * 100` | `pl_income_basics` |
| 毛利成長率 | `(gross_profit_loss / prev_gross_profit_loss - 1) * 100` | `pl_income_basics` |
| 稅前淨利成長率 | `(profit_before_tax / prev_profit_before_tax - 1) * 100` | `pl_income_basics` |
| 推銷費用占比 | `selling_expenses / operating_revenue_total * 100` | `pl_income_basics` |
| 管理費用佔比 | `general_admin_expenses / operating_revenue_total * 100` | `pl_income_basics` |
| 研發費用佔比 | `r_and_d_expenses / operating_revenue_total * 100` | `pl_income_basics` |

### Null Handling

- 除以零時回傳 `null`，顯示為「-」
- 缺少前一年度資料時，成長率回傳 `null`
- Supabase 欄位值為 `null` 時，計算結果為 `null`

## Component Design

### FinancialDataTable.jsx Props

```javascript
{
  company: string,           // 公司名稱
  metrics: MetricsData,      // 計算後的指標資料
  isLoading: boolean,        // 載入狀態
  error: string | null       // 錯誤訊息
}
```

### CSS Classes

```css
.financial-data-table {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  margin-bottom: 24px;
}

.financial-data-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.financial-data-table th {
  background: #f1f5f9;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  left: 0;
}

.financial-data-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.financial-data-table .metric-name {
  text-align: left;
  font-weight: 500;
  position: sticky;
  left: 0;
  background: #ffffff;
  z-index: 1;
}
```

## Responsive Design

- **Desktop (> 1024px)**: 完整顯示所有欄位
- **Tablet (768-1024px)**: 啟用橫向捲動
- **Mobile (< 768px)**: 橫向捲動，表格最小寬度 1200px

## Implementation Sequence

1. 建立 API endpoint `GET /api/financial/basics`
2. 實作後端計算邏輯（14 個指標）
3. 建立 `FinancialDataTable.jsx` 組件
4. 整合至 `HomePage.jsx`
5. 加入響應式樣式
6. 測試與驗證
