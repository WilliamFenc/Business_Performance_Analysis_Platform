# multi-column-form Spec Delta

## ADDED Requirements

### Requirement: Accordion 表單組件

系統 SHALL 提供可重用的 Accordion 表單組件，支援多欄位分組顯示。

#### Scenario: Accordion 區塊展開與摺疊

- **GIVEN** 使用者檢視包含多個 Accordion 區塊的表單
- **WHEN** 點擊 Accordion 標題列
- **THEN** 該區塊 SHALL 切換展開/摺疊狀態
- **AND** 其他區塊狀態 SHALL 保持不變
- **AND** SHALL 有視覺指示（箭頭圖示）顯示當前狀態

#### Scenario: 預設展開基本資訊區塊

- **GIVEN** 使用者開啟新增/編輯 Modal
- **WHEN** 表單首次渲染
- **THEN** 「基本資訊」區塊 SHALL 預設為展開狀態
- **AND** 其他區塊 SHALL 預設為摺疊狀態

#### Scenario: 全部展開與全部摺疊功能

- **GIVEN** 使用者檢視 Accordion 表單
- **WHEN** 點擊「全部展開」按鈕
- **THEN** 所有 Accordion 區塊 SHALL 展開
- **WHEN** 點擊「全部摺疊」按鈕
- **THEN** 所有 Accordion 區塊 SHALL 摺疊

#### Scenario: Accordion 鍵盤操作

- **GIVEN** 使用者使用鍵盤導航
- **WHEN** 聚焦在 Accordion 標題並按下 Enter 或 Space
- **THEN** 該區塊 SHALL 切換展開/摺疊狀態
- **AND** SHALL 符合 WCAG 無障礙標準

### Requirement: 財務報表表單

系統 SHALL 提供專用於財務報表（financial_basics）的 Accordion 表單組件。

#### Scenario: 財務報表欄位分組

- **GIVEN** 使用者編輯財務報表
- **WHEN** 表單渲染
- **THEN** SHALL 將 80+ 欄位分為 6 個邏輯區塊：
  - 基本資訊：fiscal_year, tax_id, company_name, account_item
  - 流動資產：cash_equivalents, ar_net, inventory 等（17 欄位）
  - 非流動資產：ppe, intangible_assets 等（11 欄位）
  - 流動負債：ap, income_tax_payable 等（15 欄位）
  - 非流動負債：long_term_borrowings, deferred_tax_liabilities 等（9 欄位）
  - 權益：common_stock, capital_reserves, retained_earnings 等（14 欄位）

#### Scenario: 財務報表欄位顯示格式

- **WHEN** 顯示金額類型欄位
- **THEN** SHALL 使用數字輸入框
- **AND** SHALL 允許空值（null）
- **AND** SHALL 顯示欄位中文標籤

#### Scenario: 財務報表表單驗證

- **WHEN** 使用者提交表單
- **THEN** SHALL 驗證必填欄位：fiscal_year, tax_id, company_name
- **AND** fiscal_year SHALL 在 1900-2100 範圍內
- **AND** tax_id SHALL 為 8 位數字
- **AND** 驗證失敗時 SHALL 顯示錯誤訊息並阻止提交

### Requirement: 損益表表單

系統 SHALL 提供專用於損益表（pl_income_basics）的 Accordion 表單組件。

#### Scenario: 損益表欄位分組

- **GIVEN** 使用者編輯損益表
- **WHEN** 表單渲染
- **THEN** SHALL 將 26 欄位分為 5 個邏輯區塊：
  - 基本資訊：fiscal_year, tax_id, company_name, account_item
  - 營業項目：operating_revenue_total, operating_costs_total, gross_profit_loss 等（4 欄位）
  - 營業費用：selling_expenses, general_admin_expenses, r_and_d_expenses 等（5 欄位）
  - 營業外損益：interest_income, finance_costs_net, nonop_income_expense_total 等（7 欄位）
  - 淨利相關：profit_before_tax, income_tax_expense_total, net_income（3 欄位）

#### Scenario: 損益表欄位顯示格式

- **WHEN** 顯示金額類型欄位
- **THEN** SHALL 使用數字輸入框
- **AND** SHALL 允許空值（null）
- **AND** SHALL 顯示欄位中文標籤

#### Scenario: 損益表表單驗證

- **WHEN** 使用者提交表單
- **THEN** SHALL 驗證必填欄位：fiscal_year, tax_id, company_name
- **AND** fiscal_year SHALL 在 1900-2100 範圍內
- **AND** tax_id SHALL 為 8 位數字
- **AND** 驗證失敗時 SHALL 顯示錯誤訊息並阻止提交

### Requirement: 動態欄位表格顯示

系統 SHALL 提供支援多欄位的動態表格顯示。

#### Scenario: 動態欄位渲染

- **GIVEN** 使用者切換報表類型 Tab
- **WHEN** 從「財務報表」切換到「損益表」
- **THEN** 表格 SHALL 重新渲染對應的欄位
- **AND** 財務報表 SHALL 顯示 80+ 欄位
- **AND** 損益表 SHALL 顯示 26 欄位

#### Scenario: 表格水平捲動

- **GIVEN** 表格欄位總寬度超過螢幕寬度
- **WHEN** 使用者水平捲動
- **THEN** 前兩欄（公司名稱、年度） SHALL 固定在左側
- **AND** 其餘欄位可水平捲動查看

#### Scenario: 表格欄位凍結

- **GIVEN** 表格有水平捲動
- **WHEN** 使用者向右捲動
- **THEN** 固定欄位 SHALL 保持可見
- **AND** 固定欄位 SHALL 有視覺分隔（陰影或邊框）

#### Scenario: 表格排序與篩選

- **GIVEN** 使用者檢視多欄位表格
- **WHEN** 點擊任何欄位標題
- **THEN** 該欄位 SHALL 切換排序順序（升序/降序/無）
- **AND** SHALL 有視覺指示顯示當前排序欄位
- **AND** 篩選功能 SHALL 支援公司名稱和年度篩選

### Requirement: Tab 切換功能

系統 SHALL 提供報表類型 Tab 切換功能。

#### Scenario: Tab 切換與資料載入

- **GIVEN** 使用者檢視「財務報表」Tab
- **WHEN** 點擊「損益表」Tab
- **THEN** SHALL 載入損益表資料
- **AND** SHALL 顯示損益表的欄位和資料
- **AND** 前一個 Tab 的狀態 SHALL 保留（切換回去時保持）

#### Scenario: 新增/編輯 Modal 隨 Tab 變化

- **GIVEN** 使用者在「財務報表」Tab 點擊新增
- **THEN** SHALL 顯示財務報表 Accordion 表單
- **GIVEN** 使用者在「損益表」Tab 點擊新增
- **THEN** SHALL 顯示損益表 Accordion 表單

### Requirement: 表單狀態管理

系統 SHALL 有效管理多欄位表單的狀態。

#### Scenario: 單一 formData 物件管理

- **GIVEN** 表單包含 80+ 欄位
- **WHEN** 任何欄位值變更
- **THEN** SHALL 使用單一 formData 物件管理所有欄位
- **AND** SHALL 避免為每個欄位建立獨立 useState

#### Scenario: 編輯模式預填資料

- **GIVEN** 使用者點擊編輯按鈕
- **WHEN** Modal 開啟
- **THEN** SHALL 使用現有資料預填所有欄位
- **AND** SHALL 標示為編輯模式

#### Scenario: 新增模式重置表單

- **GIVEN** 使用者剛完成一次新增操作
- **WHEN** 再次點擊新增按鈕
- **THEN** SHALL 重置所有欄位為空值
- **AND** SHALL 標示為新增模式

### Requirement: 錯誤處理與降級

系統 SHALL 在 Accordion 功能異常時提供適當的處理。

#### Scenario: Accordion 載入失敗

- **WHEN** Accordion 組件載入失敗
- **THEN** SHALL 顯示簡單表單作為備案
- **AND** SHALL 記錄錯誤訊息

#### Scenario: 表單提交失敗

- **WHEN** 表單提交時 API 回傳錯誤
- **THEN** SHALL 顯示錯誤訊息給使用者
- **AND** SHALL 保留使用者已輸入的資料
- **AND** SHALL 提供重試選項

#### Scenario: Demo 模式支援

- **WHEN** Supabase 連線失敗
- **THEN** SHALL 降級至 demo 模式
- **AND** SHALL 顯示靜態範例資料
- **AND** Accordion 表單仍可操作（僅前端狀態）
