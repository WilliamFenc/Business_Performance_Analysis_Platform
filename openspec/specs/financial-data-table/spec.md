# financial-data-table Specification

## Purpose
TBD - created by archiving change add-financial-table. Update Purpose after archive.
## Requirements
### Requirement: 詳細財務數據表 API

系統 SHALL 提供 API 端點以取得計算後的財務指標資料。

#### Scenario: 取得單一公司的詳細財務指標

- **WHEN** 呼叫 `GET /api/financial/basics?company={companyName}`
- **THEN** SHALL 查詢 Supabase `pl_income_basics` 和 `financial_basics` 表
- **AND** SHALL 計算 14 個財務指標（淨利率、毛利率、ROA、流動比率、速動比率、負債淨值比、應收帳款週轉率、存貨周轉率、營收成長率、毛利成長率、稅前淨利成長率、推銷費用占比、管理費用佔比、研發費用佔比）
- **AND** SHALL 將數值單位從「千元」轉換為「百萬元」（除以 1000）
- **AND** SHALL 回傳 JSON 格式，包含 `years` 陣列和 `metrics` 物件

#### Scenario: API 查詢公司不存在時

- **WHEN** 查詢的公司名稱不存在於資料庫
- **THEN** SHALL 回傳 `success: false`
- **AND** SHALL 包含 `error` 訊息

#### Scenario: 計算指標時處理除以零

- **WHEN** 指標計算公式中分母為零
- **THEN** SHALL 該指標值為 `null`
- **AND** 前端 SHALL 顯示為「-」

#### Scenario: 計算成長率時缺少前一年資料

- **WHEN** 計算成長率指標但前一年度資料不存在
- **THEN** SHALL 該成長率值為 `null`
- **AND** 前端 SHALL 顯示為「-」

### Requirement: 詳細財務數據表 UI 組件

系統 SHALL 提供詳細財務數據表組件，顯示多年度的財務指標比較。

#### Scenario: 表格位置與順序

- **WHEN** 使用者檢視公司財務分析頁面
- **THEN** 詳細財務數據表 SHALL 顯示在 `FinanceChart` 組件之後
- **AND** SHALL 顯示在 `DataManagerTabs` 組件之前

#### Scenario: 表格欄位顯示

- **WHEN** 表格渲染完成
- **THEN** SHALL 顯示 15 欄：第 1 欄為「年度」，第 2-15 欄為各年度
- **AND** SHALL 顯示 14 列指標（不含標題列）
- **AND** 每列 SHALL 包含指標名稱與各年度數值

#### Scenario: 指標名稱與格式

- **WHEN** 顯示指標名稱
- **THEN** SHALL 依序顯示：淨利率(%)、毛利率(%)、ROA(%)、流動比率(%)、速動比率(%)、負債淨值比(%)、應收帳款週轉率(次)、存貨周轉率(次)、營收成長率(%)、毛利成長率(%)、稅前淨利成長率(%)、推銷費用占比(%)、管理費用佔比(%)、研發費用佔比(%)

#### Scenario: 數值格式化顯示

- **WHEN** 顯示百分比類型指標（淨利率、毛利率等）
- **THEN** SHALL 顯示至小數點後兩位（如：4.02%）
- **WHEN** 顯示週轉率類型指標
- **THEN** SHALL 顯示至小數點後兩位（如：3.45 次）
- **WHEN** 數值為 `null`
- **THEN** SHALL 顯示「-」

#### Scenario: 響應式設計

- **WHEN** 螢幕寬度小於 1200px
- **THEN** 表格 SHALL 支援橫向捲動
- **AND** 最小寬度 SHALL 為 1200px
- **AND** 指標名稱欄位 SHALL 固定在左側（sticky）

### Requirement: 資料來源與單位轉換

系統 SHALL 正確處理 Supabase 資料的單位轉換。

#### Scenario: 從 Supabase 讀取損益表資料

- **WHEN** 從 `pl_income_basics` 讀取營業收入淨額（`operating_revenue_total`）
- **THEN** SHALL 將數值除以 1000 轉為百萬元
- **AND** SHALL 套用於所有金額類型欄位

#### Scenario: 從 Supabase 讀取資產負債表資料

- **WHEN** 從 `financial_basics` 讀取資產、負債、權益類型欄位
- **THEN** SHALL 將數值除以 1000 轉為百萬元
- **AND** SHALL 包含流動資產、流動負債、存貨、預付款項等

#### Scenario: 計算跨年度平均

- **WHEN** 計算需要跨年度平均的指標（如 ROA、應收帳款週轉率）
- **THEN** SHALL 使用公式：`(當年度數值 + 前一年度數值) / 2`
- **AND** 前一年度資料不存在時，該指標 SHALL 為 `null`

### Requirement: 指標計算正確性

系統 SHALL 依據財務分析標準公式計算各項指標。

#### Scenario: 淨利率計算

- **GIVEN** 稅前淨利為 161,108 千元，營業收入淨額為 4,002,787 千元
- **WHEN** 計算淨利率
- **THEN** 結果 SHALL 為 4.02%（161,108 / 4,002,787 × 100）

#### Scenario: 流動比率計算

- **GIVEN** 流動資產為 1,607,150 千元，流動負債為 978,862 千元
- **WHEN** 計算流動比率
- **THEN** 結果 SHALL 為 164.17%（1,607,150 / 978,862 × 100）

#### Scenario: 速動比率計算

- **GIVEN** 流動資產為 1,607,150 千元，存貨為 114 千元，預付款項為 87,497 千元，流動負債為 978,862 千元
- **WHEN** 計算速動比率
- **THEN** 結果 SHALL 為 155.25%（(1,607,150 - 114 - 87,497) / 978,862 × 100）

#### Scenario: 營收成長率計算

- **GIVEN** 當年度營業收入為 4,002,787 千元，前一年度為 4,748,542 千元
- **WHEN** 計算營收成長率
- **THEN** 結果 SHALL 為 -15.71%（(4,002,787 / 4,748,542 - 1) × 100）

#### Scenario: 應收帳款週轉率計算

- **GIVEN** 營業收入淨額為 4,002,787 千元
- **AND** 當年度(應收票據 + 應收帳款 + 應收帳款-關係人) = 770,655 千元
- **AND** 前一年度(應收票據 + 應收帳款 + 應收帳款-關係人) = 758,445 千元
- **WHEN** 計算應收帳款週轉率
- **THEN** 結果 SHALL 為 5.28 次（4,002,787 / ((770,655 + 758,445) / 2)）

### Requirement: API 錯誤處理

系統 SHALL 在 API 連線失敗時提供適當的錯誤處理機制。

#### Scenario: API 連線失敗時

- **WHEN** API 無法連線或回傳錯誤
- **THEN** SHALL 顯示錯誤訊息
- **AND** SHALL 提供「重新載入」按鈕

#### Scenario: Demo 模式降級

- **WHEN** API 完全無法使用
- **THEN** SHALL 支援 demo 模式
- **AND** SHALL 顯示靜態範例資料（博弘雲端）

### Requirement: 年度依賴的 KPI 計算

系統 SHALL 支援根據使用者選擇的年度動態計算 KPI 指標，而非固定使用最新年度資料。

#### Scenario: 傳遞選擇年度到 KPI 組件

- **GIVEN** 使用者在「績效洞察」面板選擇了特定年度（如 2023）
- **WHEN** `KPIAndChartsSection` 組件渲染
- **THEN** SHALL 接收 `selectedYear` prop
- **AND** SHALL 將 `selectedYear` 傳遞給 `PositiveIndicatorsCard`
- **AND** SHALL 將 `selectedYear` 傳遞給 `ConcernIndicatorsCard`

#### Scenario: 根據選擇年度取得指標資料

- **GIVEN** `metrics` 包含 years `[2021, 2022, 2023, 2024, 2025]`
- **AND** 使用者選擇 `selectedYear = 2023`
- **WHEN** `PositiveIndicatorsCard` 或 `ConcernIndicatorsCard` 計算指標
- **THEN** SHALL 使用 2023 年度的資料作為「當年度」
- **AND** SHALL 使用 2022 年度的資料作為「前一年度」
- **AND** SHALL 連續趨勢判斷使用 2021-2023 的資料

#### Scenario: 選擇年度不存在時的回退行為

- **GIVEN** `metrics` 包含 years `[2021, 2022, 2023, 2024, 2025]`
- **AND** 使用者選擇 `selectedYear = 2020`（不存在）
- **WHEN** 計算指標
- **THEN** SHALL 使用最新年度（2025）作為當年度
- **AND** 行為 SHALL 與未提供 `selectedYear` 時相同

#### Scenario: 未提供 selectedYear 時的向後相容

- **GIVEN** `PositiveIndicatorsCard` 或 `ConcernIndicatorsCard` 未收到 `selectedYear` prop
- **WHEN** 計算指標
- **THEN** SHALL 使用 `metrics.years[metrics.years.length - 1]`（最新年度）
- **AND** 行為 SHALL 與修改前完全一致

#### Scenario: 連續趨勢指標使用選擇年度往前推算

- **GIVEN** `metrics` 包含 years `[2021, 2022, 2023, 2024, 2025]`
- **AND** 使用者選擇 `selectedYear = 2023`
- **WHEN** 判斷「連續三年正成長」指標
- **THEN** SHALL 檢查 2021 → 2022 → 2023 的成長趨勢
- **AND** SHALL 不包含 2024 和 2025 的資料

#### Scenario: 連續趨勢指標資料不足時使用可用資料

- **GIVEN** `metrics` 只包含 years `[2022, 2023]`
- **AND** 使用者選擇 `selectedYear = 2023`
- **WHEN** 判斷「連續三年正成長」指標
- **THEN** SHALL 使用 2022 → 2023 的資料判斷（2 年）
- **AND** 視為「連續正成長」如果 2023 > 2022

#### Scenario: 年度比較指標根據選擇年度計算

- **GIVEN** `metrics` 包含 years `[2021, 2022, 2023, 2024, 2025]`
- **AND** 使用者選擇 `selectedYear = 2023`
- **WHEN** 計算「毛利率改善」指標
- **THEN** SHALL 比較 2023 毛利率 vs 2022 毛利率
- **AND** 若 2023 > 2022，顯示正面指標
- **AND** 若 2023 < 2022，顯示風險指標

#### Scenario: 選擇最早年度時前年度比較指標不顯示

- **GIVEN** `metrics` 包含 years `[2021, 2022, 2023, 2024, 2025]`
- **AND** 使用者選擇 `selectedYear = 2021`（最早年度）
- **WHEN** 計算需要前一年度資料的指標（如「毛利率改善」）
- **THEN** SHALL 該指標不顯示在正面/風險列表中
- **AND** 不會導致錯誤或崩潰

#### Scenario: 切換年度時 KPI 卡片即時更新

- **GIVEN** 使用者正在檢視 KPI 卡片
- **AND** 當前選擇年度為 2024
- **WHEN** 使用者將年度下拉選單改為 2023
- **THEN** `PositiveIndicatorsCard` SHALL 重新計算並顯示 2023 為基準的指標
- **AND** `ConcernIndicatorsCard` SHALL 重新計算並顯示 2023 為基準的指標
- **AND** 更新 SHALL 在選擇變更後立即發生

