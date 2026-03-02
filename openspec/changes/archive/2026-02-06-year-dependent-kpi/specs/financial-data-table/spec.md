# financial-data-table Spec Delta

## ADDED Requirements

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
