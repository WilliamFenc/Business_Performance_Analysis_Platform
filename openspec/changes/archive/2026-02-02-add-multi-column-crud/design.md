# 多欄位 CRUD 表單 - 設計文件

## 架構概觀

本變更將在現有的 React 應用程式中引入多欄位 CRUD 功能，使用摺疊式 Accordion 表單設計模式來處理財務報表（80+ 欄位）和損益表（26 欄位）的資料管理。

## 系統架構

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端 (React)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HomePage.jsx (容器組件)                                         │
│  ├── activeReportTab: 'financial-basics' | 'pl-income'          │
│  ├── financialBasicsData: []                                    │
│  └── plIncomeData: []                                           │
│                                                                  │
│  DataManagerTabs.jsx (Tab 切換)                                  │
│  ├── Tab 1: 財務報表 → DataTable + FinancialReportForm          │
│  └── Tab 2: 損益表   → DataTable + IncomeStatementForm          │
│                                                                  │
│  AccordionForm (共用模式)                                        │
│  ├── Section: 基本資訊 (展開)                                    │
│  ├── Section: 流動資產 (摺疊)                                    │
│  ├── Section: 非流動資產 (摺疊)                                  │
│  └── ...                                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     後端 API (Vercel Functions)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  api/financial-basics/index.js          GET/POST                │
│  api/financial-basics/[taxId]/[year]/   PUT/DELETE              │
│  api/pl-income/index.js                 GET/POST                │
│  api/pl-income/[taxId]/[year]/          PUT/DELETE              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  companies (id, tax_id, company_name)                           │
│  financial_basics (80+ 欄位, PK: fiscal_year, tax_id)            │
│  pl_income_basics (26 欄位, PK: fiscal_year, tax_id)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 資料流設計

### 讀取流程
```
使用者切換 Tab → HomePage 觸發 API 呼叫
→ GET /api/financial-basics/ 或 /api/pl-income/
→ Supabase 查詢對應表
→ 回傳資料至前端狀態
→ DataTable 渲染
```

### 新增/編輯流程
```
使用者點擊新增/編輯 → 開啟 Accordion Modal
→ 填寫表單欄位（可展開/摺疊區塊）
→ 點擊儲存 → 表單驗證
→ POST/PUT API 呼叫
→ Supabase INSERT/UPDATE
→ 前端狀態更新 + DataTable 重新渲染
```

### 刪除流程
```
使用者點擊刪除 → 確認對話框
→ DELETE API 呼叫
→ Supabase DELETE
→ 前端狀態移除該筆資料
→ 顯示復原通知（5 秒內可復原）
```

## Accordion 表單設計

### 狀態管理
```javascript
const [accordionState, setAccordionState] = useState({
  basicInfo: true,      // 預設展開
  currentAssets: false,
  nonCurrentAssets: false,
  currentLiabilities: false,
  // ...
});

const [formData, setFormData] = useState({
  fiscal_year: '',
  tax_id: '',
  company_name: '',
  // ... 所有欄位
});
```

### 欄位分類結構

#### 財務報表 (financial_basics)
```javascript
const financialBasicsSections = [
  {
    id: 'basicInfo',
    title: '基本資訊 (必填)',
    fields: ['fiscal_year', 'tax_id', 'company_name', 'account_item'],
    defaultOpen: true
  },
  {
    id: 'currentAssets',
    title: '流動資產',
    fields: ['cash_equivalents', 'fvtpl_assets_current', 'ar_net', 'inventory', ...],
    defaultOpen: false
  },
  {
    id: 'nonCurrentAssets',
    title: '非流動資產',
    fields: ['ppe', 'intangible_assets', 'deferred_tax_assets', ...],
    defaultOpen: false
  },
  {
    id: 'currentLiabilities',
    title: '流動負債',
    fields: ['ap', 'income_tax_payable', 'total_current_liabilities', ...],
    defaultOpen: false
  },
  {
    id: 'nonCurrentLiabilities',
    title: '非流動負債',
    fields: ['long_term_borrowings', 'deferred_tax_liabilities', ...],
    defaultOpen: false
  },
  {
    id: 'equity',
    title: '權益',
    fields: ['common_stock', 'capital_reserves', 'retained_earnings', ...],
    defaultOpen: false
  }
];
```

#### 損益表 (pl_income_basics)
```javascript
const plIncomeSections = [
  {
    id: 'basicInfo',
    title: '基本資訊 (必填)',
    fields: ['fiscal_year', 'tax_id', 'company_name', 'account_item'],
    defaultOpen: true
  },
  {
    id: 'operating',
    title: '營業項目',
    fields: ['operating_revenue_total', 'operating_costs_total', 'gross_profit_loss', ...],
    defaultOpen: false
  },
  {
    id: 'operatingExpenses',
    title: '營業費用',
    fields: ['selling_expenses', 'general_admin_expenses', 'r_and_d_expenses', ...],
    defaultOpen: false
  },
  {
    id: 'nonOperating',
    title: '營業外損益',
    fields: ['interest_income', 'finance_costs_net', 'nonop_income_expense_total', ...],
    defaultOpen: false
  },
  {
    id: 'netProfit',
    title: '淨利相關',
    fields: ['profit_before_tax', 'income_tax_expense_total', 'net_income'],
    defaultOpen: false
  }
];
```

## 表格顯示設計

### 動態欄位渲染
```javascript
// 根據 activeTab 決定顯示哪些欄位
const getColumns = (activeTab) => {
  if (activeTab === 'financial-basics') {
    return [
      { key: 'company_name', label: '公司名稱', sticky: true },
      { key: 'fiscal_year', label: '年度', sticky: true },
      { key: 'cash_equivalents', label: '現金及約當現金' },
      { key: 'ar_net', label: '應收帳款淨額' },
      // ... 所有 80+ 欄位
    ];
  } else {
    return [
      { key: 'company_name', label: '公司名稱', sticky: true },
      { key: 'fiscal_year', label: '年度', sticky: true },
      { key: 'operating_revenue_total', label: '營業收入合計' },
      { key: 'profit_before_tax', label: '稅前淨利' },
      // ... 所有 26 欄位
    ];
  }
};
```

### 水平捲動與欄位凍結
```css
.table-container {
  overflow-x: auto;
  position: relative;
}

.table-container table {
  border-collapse: separate;
  border-spacing: 0;
}

.table-container th.sticky,
.table-container td.sticky {
  position: sticky;
  left: 0;
  z-index: 1;
  background: white;
}
```

## 權欄位驗證規則

| 欄位 | 類型 | 必填 | 驗證規則 |
|------|------|------|----------|
| fiscal_year | number | 是 | 1900-2100 |
| tax_id | string | 是 | 8 位數字 |
| company_name | string | 是 | 非空 |
| account_item | string | 否 | - |
| 金額欄位 | number | 否 | 若輸入必為數字 |

## 效能考量

### 問題：80+ 欄位表單的效能
1. **渲染效能**：大量 input 元素可能影響初始渲染
2. **狀態管理**：80+ 個狀態欄位需要有效率的管理方式

### 解決方案
1. **延遲渲染**：只渲染展開區塊的欄位
2. **狀態合併**：使用單一 formData 物件而非多個 useState
3. **記憶化**：使用 useMemo 快取欄位定義

```javascript
// 只渲染展開的區塊
{sections.map(section => (
  accordionState[section.id] && (
    <AccordionSection key={section.id} fields={section.fields} />
  )
))}
```

## 相容性設計

### 向下相容
- 現有的 4 欄位簡單表單功能保留在 demo 模式
- API 端點保持現有格式，新增端點不影響現有功能

### 漸進式增強
- 若 Supabase 連線失敗，降級至 demo 模式
- 若 Accordion 功能載入失敗，顯示簡單表單備案

## 測試策略

### 單元測試
- Accordion 展開/摺疊邏輯
- 表單驗證規則
- 欄位分類結構

### 整合測試
- CRUD 端對端流程
- API 呼叫與狀態同步
- Tab 切換功能

### E2E 測試（Playwright）
- 新增財務報表
- 編輯損益表
- 刪除並復原
- 匯入/匯出功能
