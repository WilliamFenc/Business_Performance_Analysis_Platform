# 提案：多欄位 CRUD 表單改版

## Change ID
`add-multi-column-crud`

## 概述

將現有的「數據與檔案管理」區塊從簡單的 4 欄位 CRUD（公司、年份、營收、淨利）改版為支援多欄位的財務報表（financial_basics，80+ 欄位）及損益表（pl_income_basics，26 欄位）的完整 CRUD 功能。

## 動機

### 現況問題
1. **欄位限制**：現有的 EditModal 只支援 4 個固定欄位，無法處理 Supabase 中已有的完整財務報表資料
2. **資料未充分利用**：Supabase 已有 `financial_basics`（80+ 欄位）和 `pl_income_basics`（26 欄位）兩張表，但前端只能操作簡化的 4 欄位資料
3. **使用者體驗**：需要更適合多欄位情境的表單設計，提升資料管理效率

### 預期效益
1. **完整資料管理**：使用者可以直接編輯所有財務報表欄位，不需透過資料庫工具
2. **提升效率**：使用摺疊式 Accordion 表單，讓使用者可以專注於當前編輯的區塊
3. **未來擴展性**：建立可重用的多欄位表單模式，方便未來新增其他報表類型

## 設計方案

### UI/UX 設計：摺疊式 Accordion 表單

根據研究參考以下最佳實作範例：
- [Material React Table V3 - Editing CRUD Example](https://www.material-react-table.com/docs/examples/editing-crud)
- [React Hook Form Multi-Step Tutorial (2025)](https://buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps)
- [32 Stepper UI Examples](https://www.eleken.co/blog-posts/stepper-ui-examples)

### 主要功能

1. **Tab 切換**：
   - 財務報表（financial_basics）- 80+ 欄位
   - 損益表（pl_income_basics）- 26 欄位

2. **Accordion 表單**：
   - 將欄位按邏輯分組（資產、負債、權益等）
   - 預設展開「基本資訊」區塊
   - 支援「全部展開」和「全部摺疊」按鈕

3. **表格顯示**：
   - 完整模式：顯示所有欄位
   - 水平捲動支援
   - 固定前兩欄（公司名稱、年度）

### ASCII UI/UX 預覽

```
┌─────────────────────────────────────────────────────────────────┐
│  數據與檔案管理                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [📊 財務報表] [💰 損益表]      [+ 新增] [📥 匯入] [📤 匯出] │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  篩選: [公司 ▼] [年度 ▼]   搜尋: [________________]              │
│                                                                  │
│  ┌──────┬────────┬──────┬──────────┬──────────┬─────────┬────┐│
│  │ 編輯 │ 公司   │ 年度 │ 現金及約  │ 應收帳款  │ 總資產  │ ...││
│  ├──────┼────────┼──────┼──────────┼──────────┼─────────┼────┤│
│  │ ✏️   │ 博弘   │ 2024 │ 720,946  │ 708,366  │ 1,607K  │ ◀► ││ ← 水平捲動
│  │ ✏️   │ 中華電 │ 2024 │ 36,259M  │ 26,025M  │ 534,49M │    ││
│  │ ✏️   │ 遠傳   │ 2024 │ 15,432M  │ 12,345M  │ 234,56M │    ││
│  └──────┴────────┴──────┴──────────┴──────────┴─────────┴────┘│
│                                                                  │
│  第 1 頁，共 2 頁 (共 20 筆)       [上一頁] [1] [2] [下一頁]   │
└─────────────────────────────────────────────────────────────────┘
```

新增/編輯 Modal（Accordion 表單）：

```
┌──────────────────────────────────────────────────────────────────┐
│ ✏️ 編輯財務報表 - 博弘雲端 (2024)                        [×]     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ▼ 基本資訊 (必填)                                  [全部展開]   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 年度:             [2024        ]                       │    │
│  │ 統一編號:         [28497918    ]                       │    │
│  │ 公司名稱:         [博弘雲端     ]                       │    │
│  │ 會計科目:         [6997 博弘    ]                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ▼ 流動資產 (17 欄位)                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 現金及約當現金                    [720,946       ]      │    │
│  │ 應收票據淨額                    [20,145        ]      │    │
│  │ 應收帳款淨額                    [708,366      ]      │    │
│  │ 應收帳款-關係人淨額              [42,144       ]      │    │
│  │ 存貨                            [114          ]      │    │
│  │ 預付款項                        [87,497       ]      │    │
│  │ [顯示更多 11 個欄位 ▼]                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ▲ 非流動資產 (11 欄位) [摺疊]                                   │
│  ▲ 流動負債 (15 欄位) [摺疊]                                    │
│  ▲ 非流動負債 (9 欄位) [摺疊]                                   │
│  ▲ 權益 (14 欄位) [摺疊]                                        │
│                                                                  │
│                                    [取消]  [儲存為草稿]  [確定新增]│
└──────────────────────────────────────────────────────────────────┘
```

## 影響範圍

### 修改的 Specs
- `data-layer` - 新增 financial_basics 和 pl_income_basics 的 CRUD API

### 新增的 Specs
- `multi-column-form` - 多欄位 Accordion 表單組件規範

### 修改的檔案
- `src/components/DataTable.jsx` - 動態欄位渲染
- `src/components/EditModal.jsx` - 整合 Accordion 表單
- `src/components/DataManagerTabs.jsx` - Tab 切換為報表類型
- `src/components/ControlPanel.jsx` - 移除簡單表單，支援多報表
- `src/pages/HomePage.jsx` - 新增狀態管理和 API 呼叫

### 新增的檔案
- `src/components/FinancialReportForm.jsx` - 財務報表 Accordion 表單
- `src/components/IncomeStatementForm.jsx` - 損益表 Accordion 表單
- `api/financial-basics/index.js` - 財務報表 API
- `api/financial-basics/[taxId]/[year]/index.js` - 財務報表單筆 API
- `api/pl-income/index.js` - 損益表 API
- `api/pl-income/[taxId]/[year]/index.js` - 損益表單筆 API

## 替代方案考慮

| 方案 | 優點 | 缺點 | 選擇 |
|------|------|------|------|
| 方案 A：分區表單 + Modal | 步驟清晰，適合流程式填寫 | 需要多次上一步/下一步 | ❌ |
| 方案 B：側邊面板編輯 | 可同時看到表格和表單 | 佔用螢幕空間，複雜度高 | ❌ |
| 方案 C：摺疊式 Accordion | 所有欄位在同一頁，可快速切換 | 需要良好的摺疊狀態管理 | ✅ |

## 相關連結

- [Material React Table V3 - Editing CRUD Example](https://www.material-react-table.com/docs/examples/editing-crud)
- [React Hook Form Multi-Step Tutorial (2025)](https://buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps)
- [32 Stepper UI Examples](https://www.eleken.co/blog-posts/stepper-ui-examples)
- [Designing effective data table UI – Justinmind](https://www.justinmind.com/ui-design/data-table)
