# Design: KPI 和圖表區塊

## Overview
本文件描述「KPI 和圖表區塊」的技術設計，包括組件架構、資料流動、圖表配置和 KPI 分析邏輯。

## Component Architecture

```
HomePage
├── FinanceChart (現有)
├── FinancialDataTable (現有)
└── [NEW] KPIAndChartsSection
    ├── [LEFT] KPIAnalysisPanel
    │   ├── ExecutiveSummaryCard
    │   ├── PositiveIndicatorsCard
    │   └── ConcernIndicatorsCard
    └── [RIGHT] FinancialChartsGrid
        ├── ProfitabilityChart
        ├── SolvencyChart
        ├── AREfficiencyChart
        ├── InventoryChart
        ├── GrowthChart
        └── ExpenseTrendChart
```

## Layout Design

### Container Structure
```jsx
<div className="kpi-charts-section">
  {/* 左側 KPI 區域 - 25% 寬度 */}
  <div className="kpi-panel">
    <ExecutiveSummaryCard data={metrics} />
    <PositiveIndicatorsCard data={metrics} />
    <ConcernIndicatorsCard data={metrics} />
  </div>

  {/* 右側圖表區域 - 75% 寬度 */}
  <div className="charts-grid">
    <div className="chart-item"><ProfitabilityChart data={metrics} /></div>
    <div className="chart-item"><SolvencyChart data={metrics} /></div>
    <div className="chart-item"><AREfficiencyChart data={metrics} /></div>
    <div className="chart-item"><InventoryChart data={metrics} /></div>
    <div className="chart-item"><GrowthChart data={metrics} /></div>
    <div className="chart-item"><ExpenseTrendChart data={metrics} /></div>
  </div>
</div>
```

### CSS Grid 佈局
```css
.kpi-charts-section {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.kpi-panel {
  flex: 0 0 25%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.charts-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-item {
  min-height: 280px;
}

/* 響應式: 小螢幕時改為單欄 */
@media (max-width: 1024px) {
  .kpi-charts-section {
    flex-direction: column;
  }
  .kpi-panel {
    flex: none;
    width: 100%;
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
```

## Chart Configurations

### 圖表 A: 獲利能力 (Profitability)
```javascript
// 資料來源
{
  years: ['2020', '2021', '2022', '2023', '2024'],
  netProfitMargin: [2.4, 2.4, 1.6, 2.5, 4.0],
  grossMargin: [9.8, 9.4, 8.3, 9.2, 11.6],
  roa: [null, 7.2, 4.9, 5.9, 7.6]
}

// Nivo Line Chart 配置
<ResponsiveLine
  data={[
    { id: '淨利率', data: [...] },
    { id: '毛利率', data: [...] },
    { id: 'ROA', data: [...] }
  ]}
  yScale={{ type: 'linear', min: 0, max: 'auto' }}
  axisLeft={{ legend: '百分比 (%)', legendOffset: -50 }}
  colors={{ scheme: 'nivo' }} // 或指定顏色
/>
```

### 圖表 B: 償債結構 (Solvency)
```javascript
// 資料來源
{
  currentRatio: [120, 118, 120, 132, 175],
  quickRatio: [107, 107, 108, 119, 166],
  debtEquityRatio: [517, 574, 525, 355, 156]
}

// 需要除以 100 顯示為小數
```

### 圖表 C: 經營效率 (AR Efficiency)
```javascript
// 資料來源
{
  arTurnover: [10, 7, 7, 6, 5]  // 單位: 次
}

// 混合圖: 長條圖顯示次數，折線顯示趨�
```

### 圖表 D: 存貨週轉 (Inventory)
```javascript
// 資料來源
{
  inventoryTurnover: [10, 7, 7, 6, 31331]  // 單位: 次
  // 注意: 31331 異常值需要處理（可能是資料問題）
}

// 混合圖: 長條圖
```

### 圖表 E: 成長動能 (Growth)
```javascript
// 資料來源
{
  revenueGrowth: [null, 70, 44, -6, -16],
  grossProfitGrowth: [null, 52, 27, 4, 17],
  profitBeforeTaxGrowth: [null, 68, -5, 53, 33]
}

// 折線圖，顯示正負成長
// 負值用紅色，正值用綠色（或不同色系）
```

### 圖表 F: 費用率趨勢 (Expense Trend)
```javascript
// 資料來源
{
  sellingExpenseRatio: [6, 4, 4, 4, 5],
  adminExpenseRatio: [2, 1, 1, 2, 3],
  rdExpenseRatio: [0, 0, 0, 0, 1]
}

// 折線圖
```

## KPI Analysis Logic

> **判斷邏輯來源**: 財務分析指標.xlsx > 財務比率說明

### 綜合分析評論 (EXECUTIVE SUMMARY)

```javascript
// 目前保留空白，未來將使用 LLM 產出分析內容
function generateExecutiveSummary(metrics) {
  return null; // 保留空白
}
```

**UI 實作**: 顯示空卡片，可選擇顯示「分析內容產生中...」或僅顯示標題。

---

### 正面指標判斷規則 (Positive)

根據「財務比率說明」中的正面判斷條件：

```javascript
function getPositiveIndicators(metrics) {
  const latest = getLatestYear(metrics);
  const previous = getPreviousYear(metrics);
  const trends = calculateTrends(metrics);
  const positives = [];

  // 1. 淨利率: 大於10%
  if (latest.netProfitMargin > 10) {
    positives.push({
      metric: '淨利率',
      value: latest.netProfitMargin,
      criteria: '>10%',
      reason: '獲利能力優異'
    });
  }

  // 2. 淨利率: 前一年度<0%，本年度>0% (轉虧為盈)
  if (previous?.netProfitMargin < 0 && latest.netProfitMargin > 0) {
    positives.push({
      metric: '淨利率',
      value: latest.netProfitMargin,
      criteria: '轉虧為盈',
      reason: '由虧轉盈'
    });
  }

  // 3. 毛利率: 大於10%
  if (latest.grossMargin > 10) {
    positives.push({
      metric: '毛利率',
      value: latest.grossMargin,
      criteria: '>10%',
      reason: '毛利表現良好'
    });
  }

  // 4. 毛利率: 本年度 > 前一年度
  if (latest.grossMargin > previous?.grossMargin) {
    positives.push({
      metric: '毛利率',
      value: latest.grossMargin,
      criteria: '優於去年',
      reason: '毛利率改善'
    });
  }

  // 5. ROA: 連續三年皆呈現正成長
  if (isThreeYearPositiveGrowth(metrics, 'roa')) {
    positives.push({
      metric: 'ROA',
      value: latest.roa,
      criteria: '連續三年正成長',
      reason: '資產報酬率持續提升'
    });
  }

  // 6. 流動比率: 大於2
  if (latest.currentRatio > 200) {
    positives.push({
      metric: '流動比率',
      value: latest.currentRatio / 100,
      unit: '',
      criteria: '>2',
      reason: '短期償債能力強'
    });
  }

  // 7. 流動比率: 大於1且速動比率>0.8
  if (latest.currentRatio > 100 && latest.quickRatio > 80) {
    positives.push({
      metric: '流動/速動比率',
      value: `${(latest.currentRatio / 100).toFixed(2)}/${(latest.quickRatio / 100).toFixed(2)}`,
      criteria: '流動>1 且 速動>0.8',
      reason: '償債結構健康'
    });
  }

  // 8. 流動比率: 前一年度<1，本年度>1 (改善)
  if (previous?.currentRatio < 100 && latest.currentRatio > 100) {
    positives.push({
      metric: '流動比率',
      value: latest.currentRatio / 100,
      criteria: '改善',
      reason: '流動比率由低於1改善至高於1'
    });
  }

  // 9. 速動比率: 大於0.8
  if (latest.quickRatio > 80) {
    positives.push({
      metric: '速動比率',
      value: latest.quickRatio / 100,
      criteria: '>0.8',
      reason: '速動資產充足'
    });
  }

  // 10. 速動比率: 前一年度<0.8，本年度>0.8
  if (previous?.quickRatio < 80 && latest.quickRatio > 80) {
    positives.push({
      metric: '速動比率',
      value: latest.quickRatio / 100,
      criteria: '改善',
      reason: '速動比率改善'
    });
  }

  // 11. 負債淨值比: 小於100%
  if (latest.debtEquityRatio < 100) {
    positives.push({
      metric: '負債淨值比',
      value: latest.debtEquityRatio / 100,
      criteria: '<100%',
      reason: '槓桿比例保守'
    });
  }

  // 12. 應收帳款週轉率: 大於6
  if (latest.arTurnover > 6) {
    positives.push({
      metric: '應收週轉',
      value: latest.arTurnover,
      unit: '次',
      criteria: '>6次',
      reason: '收款效率良好'
    });
  }

  // 13. 存貨周轉率: 大於4
  if (latest.inventoryTurnover > 4) {
    positives.push({
      metric: '存貨周轉',
      value: latest.inventoryTurnover,
      unit: '次',
      criteria: '>4次',
      reason: '存貨管理效率良好'
    });
  }

  // 14. 營收成長率: 大於10%
  if (latest.revenueGrowth > 10) {
    positives.push({
      metric: '營收成長',
      value: latest.revenueGrowth,
      unit: '%',
      criteria: '>10%',
      reason: '營收強勁成長'
    });
  }

  // 15. 營收成長率: 連續三年>10%
  if (isThreeYearAbove(metrics, 'revenueGrowth', 10)) {
    positives.push({
      metric: '營收成長',
      value: latest.revenueGrowth,
      unit: '%',
      criteria: '連續三年>10%',
      reason: '營收持續強勁成長'
    });
  }

  // 16. 毛利成長率: 連續三年皆呈現正成長
  if (isThreeYearPositiveGrowth(metrics, 'grossProfitGrowth')) {
    positives.push({
      metric: '毛利成長',
      value: latest.grossProfitGrowth,
      unit: '%',
      criteria: '連續三年正成長',
      reason: '毛利持續成長'
    });
  }

  // 17. 毛利成長率: 成長幅度超過5%
  if (latest.grossProfitGrowth > 5) {
    positives.push({
      metric: '毛利成長',
      value: latest.grossProfitGrowth,
      unit: '%',
      criteria: '>5%',
      reason: '毛利成長幅度佳'
    });
  }

  // 18. 稅前淨利成長率: 連續三年皆呈現正成長
  if (isThreeYearPositiveGrowth(metrics, 'profitBeforeTaxGrowth')) {
    positives.push({
      metric: '稅前淨利成長',
      value: latest.profitBeforeTaxGrowth,
      unit: '%',
      criteria: '連續三年正成長',
      reason: '獲利持續成長'
    });
  }

  // 19. 稅前淨利成長率: 成長幅度超過5%
  if (latest.profitBeforeTaxGrowth > 5) {
    positives.push({
      metric: '稅前淨利成長',
      value: latest.profitBeforeTaxGrowth,
      unit: '%',
      criteria: '>5%',
      reason: '獲利成長幅度佳'
    });
  }

  return positives;
}
```

---

### 風險/關注指標判斷規則 (Concern)

根據「財務比率說明」中的負面判斷條件：

```javascript
function getConcernIndicators(metrics) {
  const latest = getLatestYear(metrics);
  const previous = getPreviousYear(metrics);
  const trends = calculateTrends(metrics);
  const concerns = [];

  // 1. 淨利率: 小於0%
  if (latest.netProfitMargin < 0) {
    concerns.push({
      metric: '淨利率',
      value: latest.netProfitMargin,
      criteria: '<0%',
      reason: '虧損',
      level: 'critical'
    });
  }

  // 2. 淨利率: 前一年度>0%，本年度<0% (轉盈為虧)
  if (previous?.netProfitMargin > 0 && latest.netProfitMargin < 0) {
    concerns.push({
      metric: '淨利率',
      value: latest.netProfitMargin,
      criteria: '轉盈為虧',
      reason: '由盈轉虧',
      level: 'critical'
    });
  }

  // 3. 淨利率: 連續三年以上<0%
  if (isThreeYearBelow(metrics, 'netProfitMargin', 0)) {
    concerns.push({
      metric: '淨利率',
      value: latest.netProfitMargin,
      criteria: '連續三年以上虧損',
      reason: '長期虧損',
      level: 'critical'
    });
  }

  // 4. 毛利率: 小於0%
  if (latest.grossMargin < 0) {
    concerns.push({
      metric: '毛利率',
      value: latest.grossMargin,
      criteria: '<0%',
      reason: '毛利為負',
      level: 'critical'
    });
  }

  // 5. 毛利率: 本年度 < 前一年度
  if (latest.grossMargin < previous?.grossMargin) {
    concerns.push({
      metric: '毛利率',
      value: latest.grossMargin,
      criteria: '衰退',
      reason: '毛利率下滑'
    });
  }

  // 6. ROA: 小於5%
  if (latest.roa < 5 && latest.roa !== null) {
    concerns.push({
      metric: 'ROA',
      value: latest.roa,
      criteria: '<5%',
      reason: '資產報酬率偏低'
    });
  }

  // 7. ROA: 小於0%
  if (latest.roa < 0) {
    concerns.push({
      metric: 'ROA',
      value: latest.roa,
      criteria: '<0%',
      reason: '資產報酬率為負',
      level: 'critical'
    });
  }

  // 8. 流動比率: 小於1
  if (latest.currentRatio < 100) {
    concerns.push({
      metric: '流動比率',
      value: latest.currentRatio / 100,
      criteria: '<1',
      reason: '短期償債能力不足'
    });
  }

  // 9. 流動比率: 前一年度>1，本年度<1
  if (previous?.currentRatio > 100 && latest.currentRatio < 100) {
    concerns.push({
      metric: '流動比率',
      value: latest.currentRatio / 100,
      criteria: '惡化',
      reason: '流動比率惡化'
    });
  }

  // 10. 速動比率: 小於0.8
  if (latest.quickRatio < 80) {
    concerns.push({
      metric: '速動比率',
      value: latest.quickRatio / 100,
      criteria: '<0.8',
      reason: '速動資產不足'
    });
  }

  // 11. 速動比率: 前一年度>0.8，本年度<0.8
  if (previous?.quickRatio > 80 && latest.quickRatio < 80) {
    concerns.push({
      metric: '速動比率',
      value: latest.quickRatio / 100,
      criteria: '惡化',
      reason: '速動比率惡化'
    });
  }

  // 12. 負債淨值比: 大於200%
  if (latest.debtEquityRatio > 200) {
    concerns.push({
      metric: '負債淨值比',
      value: latest.debtEquityRatio / 100,
      criteria: '>200%',
      reason: '槓桿比例偏高'
    });
  }

  // 13. 負債淨值比: 連續三年皆呈現正成長 (負債持續增加)
  if (isThreeYearPositiveGrowth(metrics, 'debtEquityRatio')) {
    concerns.push({
      metric: '負債淨值比',
      value: latest.debtEquityRatio / 100,
      criteria: '連續三年正成長',
      reason: '負債持續增加'
    });
  }

  // 14. 應收帳款週轉率: 小於4
  if (latest.arTurnover < 4 && latest.arTurnover !== null) {
    concerns.push({
      metric: '應收週轉',
      value: latest.arTurnover,
      unit: '次',
      criteria: '<4次',
      reason: '收款效率偏低'
    });
  }

  // 15. 應收帳款週轉率: 連續三年皆呈現負成長
  if (isThreeYearNegativeGrowth(metrics, 'arTurnover')) {
    concerns.push({
      metric: '應收週轉',
      value: latest.arTurnover,
      unit: '次',
      criteria: '連續三年負成長',
      reason: '收款效率持續下降'
    });
  }

  // 16. 存貨周轉率: 小於2
  if (latest.inventoryTurnover < 2 && latest.inventoryTurnover !== null) {
    concerns.push({
      metric: '存貨周轉',
      value: latest.inventoryTurnover,
      unit: '次',
      criteria: '<2次',
      reason: '存貨周轉偏低'
    });
  }

  // 17. 存貨周轉率: 連續三年皆呈現負成長
  if (isThreeYearNegativeGrowth(metrics, 'inventoryTurnover')) {
    concerns.push({
      metric: '存貨周轉',
      value: latest.inventoryTurnover,
      unit: '次',
      criteria: '連續三年負成長',
      reason: '存貨周轉持續下降'
    });
  }

  // 18. 營收成長率: 小於0%
  if (latest.revenueGrowth < 0) {
    concerns.push({
      metric: '營收成長',
      value: latest.revenueGrowth,
      unit: '%',
      criteria: '<0%',
      reason: '營收衰退'
    });
  }

  // 19. 營收成長率: 連續三年<0%
  if (isThreeYearBelow(metrics, 'revenueGrowth', 0)) {
    concerns.push({
      metric: '營收成長',
      value: latest.revenueGrowth,
      unit: '%',
      criteria: '連續三年<0%',
      reason: '營收持續衰退',
      level: 'high'
    });
  }

  // 20. 毛利成長率: 連續三年皆呈現負成長
  if (isThreeYearNegativeGrowth(metrics, 'grossProfitGrowth')) {
    concerns.push({
      metric: '毛利成長',
      value: latest.grossProfitGrowth,
      unit: '%',
      criteria: '連續三年負成長',
      reason: '毛利持續衰退'
    });
  }

  // 21. 毛利成長率: 衰退幅度超過5%
  if (latest.grossProfitGrowth < -5) {
    concerns.push({
      metric: '毛利成長',
      value: latest.grossProfitGrowth,
      unit: '%',
      criteria: '<-5%',
      reason: '毛利大幅衰退'
    });
  }

  // 22. 稅前淨利成長率: 連續三年皆呈現負成長
  if (isThreeYearNegativeGrowth(metrics, 'profitBeforeTaxGrowth')) {
    concerns.push({
      metric: '稅前淨利成長',
      value: latest.profitBeforeTaxGrowth,
      unit: '%',
      criteria: '連續三年負成長',
      reason: '獲利持續衰退'
    });
  }

  // 23. 稅前淨利成長率: 衰退幅度超過5%
  if (latest.profitBeforeTaxGrowth < -5) {
    concerns.push({
      metric: '稅前淨利成長',
      value: latest.profitBeforeTaxGrowth,
      unit: '%',
      criteria: '<-5%',
      reason: '獲利大幅衰退'
    });
  }

  // 24. 推銷費用占比: 占比超過5%
  if (latest.sellingExpenseRatio > 5) {
    concerns.push({
      metric: '推銷費用占比',
      value: latest.sellingExpenseRatio,
      unit: '%',
      criteria: '>5%',
      reason: '推銷費用偏高'
    });
  }

  // 25. 推銷費用占比: 連續三年皆呈現正成長
  if (isThreeYearPositiveGrowth(metrics, 'sellingExpenseRatio')) {
    concerns.push({
      metric: '推銷費用占比',
      value: latest.sellingExpenseRatio,
      unit: '%',
      criteria: '連續三年正成長',
      reason: '推銷費用持續上升'
    });
  }

  // 26. 推銷費用占比: 相較去年度成長超過3%
  if (latest.sellingExpenseRatio - previous?.sellingExpenseRatio > 3) {
    concerns.push({
      metric: '推銷費用占比',
      value: latest.sellingExpenseRatio,
      unit: '%',
      criteria: '年增>3%',
      reason: '推銷費用快速上升'
    });
  }

  // 27. 管理費用佔比: 占比超過5%
  if (latest.adminExpenseRatio > 5) {
    concerns.push({
      metric: '管理費用佔比',
      value: latest.adminExpenseRatio,
      unit: '%',
      criteria: '>5%',
      reason: '管理費用偏高'
    });
  }

  // 28. 管理費用佔比: 連續三年皆呈現正成長
  if (isThreeYearPositiveGrowth(metrics, 'adminExpenseRatio')) {
    concerns.push({
      metric: '管理費用佔比',
      value: latest.adminExpenseRatio,
      unit: '%',
      criteria: '連續三年正成長',
      reason: '管理費用持續上升'
    });
  }

  // 29. 管理費用佔比: 相較去年度成長超過3%
  if (latest.adminExpenseRatio - previous?.adminExpenseRatio > 3) {
    concerns.push({
      metric: '管理費用佔比',
      value: latest.adminExpenseRatio,
      unit: '%',
      criteria: '年增>3%',
      reason: '管理費用快速上升'
    });
  }

  // 30. 研發費用佔比: 占比超過5%
  if (latest.rdExpenseRatio > 5) {
    concerns.push({
      metric: '研發費用佔比',
      value: latest.rdExpenseRatio,
      unit: '%',
      criteria: '>5%',
      reason: '研發費用偏高'
    });
  }

  // 31. 研發費用佔比: 連續三年皆呈現正成長
  if (isThreeYearPositiveGrowth(metrics, 'rdExpenseRatio')) {
    concerns.push({
      metric: '研發費用佔比',
      value: latest.rdExpenseRatio,
      unit: '%',
      criteria: '連續三年正成長',
      reason: '研發費用持續上升'
    });
  }

  // 32. 研發費用佔比: 相較去年度成長超過3%
  if (latest.rdExpenseRatio - previous?.rdExpenseRatio > 3) {
    concerns.push({
      metric: '研發費用佔比',
      value: latest.rdExpenseRatio,
      unit: '%',
      criteria: '年增>3%',
      reason: '研發費用快速上升'
    });
  }

  return concerns;
}
```

---

### 輔助函式

```javascript
// 取得最新年度資料
function getLatestYear(metrics) {
  const lastIndex = metrics.years.length - 1;
  return {
    year: metrics.years[lastIndex],
    netProfitMargin: metrics.netProfitMargin[lastIndex],
    grossMargin: metrics.grossMargin[lastIndex],
    roa: metrics.roa[lastIndex],
    currentRatio: metrics.currentRatio[lastIndex],
    quickRatio: metrics.quickRatio[lastIndex],
    debtEquityRatio: metrics.debtEquityRatio[lastIndex],
    arTurnover: metrics.arTurnover[lastIndex],
    inventoryTurnover: metrics.inventoryTurnover[lastIndex],
    revenueGrowth: metrics.revenueGrowth[lastIndex],
    grossProfitGrowth: metrics.grossProfitGrowth[lastIndex],
    profitBeforeTaxGrowth: metrics.profitBeforeTaxGrowth[lastIndex],
    sellingExpenseRatio: metrics.sellingExpenseRatio[lastIndex],
    adminExpenseRatio: metrics.adminExpenseRatio[lastIndex],
    rdExpenseRatio: metrics.rdExpenseRatio[lastIndex],
  };
}

// 取得前一年度資料
function getPreviousYear(metrics) {
  const prevIndex = metrics.years.length - 2;
  if (prevIndex < 0) return null;
  return {
    year: metrics.years[prevIndex],
    netProfitMargin: metrics.netProfitMargin[prevIndex],
    grossMargin: metrics.grossMargin[prevIndex],
    roa: metrics.roa[prevIndex],
    currentRatio: metrics.currentRatio[prevIndex],
    quickRatio: metrics.quickRatio[prevIndex],
    debtEquityRatio: metrics.debtEquityRatio[prevIndex],
    arTurnover: metrics.arTurnover[prevIndex],
    inventoryTurnover: metrics.inventoryTurnover[prevIndex],
    revenueGrowth: metrics.revenueGrowth[prevIndex],
    grossProfitGrowth: metrics.grossProfitGrowth[prevIndex],
    profitBeforeTaxGrowth: metrics.profitBeforeTaxGrowth[prevIndex],
    sellingExpenseRatio: metrics.sellingExpenseRatio[prevIndex],
    adminExpenseRatio: metrics.adminExpenseRatio[prevIndex],
    rdExpenseRatio: metrics.rdExpenseRatio[prevIndex],
  };
}

// 檢查連續三年皆呈現正成長
function isThreeYearPositiveGrowth(metrics, metricKey) {
  const arr = metrics[metricKey];
  if (arr.length < 3) return false;
  const last3 = arr.slice(-3);
  return last3.every((v, i) => i === 0 || v > last3[i - 1]);
}

// 檢查連續三年皆呈現負成長
function isThreeYearNegativeGrowth(metrics, metricKey) {
  const arr = metrics[metricKey];
  if (arr.length < 3) return false;
  const last3 = arr.slice(-3);
  return last3.every((v, i) => i === 0 || v < last3[i - 1]);
}

// 檢查連續三年皆高於某值
function isThreeYearAbove(metrics, metricKey, threshold) {
  const arr = metrics[metricKey];
  if (arr.length < 3) return false;
  return arr.slice(-3).every(v => v > threshold);
}

// 檢查連續三年皆低於某值
function isThreeYearBelow(metrics, metricKey, threshold) {
  const arr = metrics[metricKey];
  if (arr.length < 3) return false;
  return arr.slice(-3).every(v => v < threshold);
}
```

## Data Flow

```
HomePage
  │
  ├─ fetchFinancialBasics(company)
  │   └─ GET /api/financial/basics?company=xxx
  │       └─ { success: true, data: { years, metrics } }
  │
  └─ pass metrics to KPIAndChartsSection
      │
      ├─ KPIAnalysisPanel
      │   ├─ ExecutiveSummaryCard (分析邏輯生成文字)
      │   ├─ PositiveIndicatorsCard (篩選正面指標)
      │   └─ ConcernIndicatorsCard (篩選風險指標)
      │
      └─ FinancialChartsGrid
          ├─ ProfitabilityChart (圖表化)
          ├─ SolvencyChart (圖表化)
          ├─ AREfficiencyChart (圖表化)
          ├─ InventoryChart (圖表化)
          ├─ GrowthChart (圖表化)
          └─ ExpenseTrendChart (圖表化)
```

## Technical Considerations

### 1. 資料異常值處理
- `inventoryTurnover` 的異常高值（如 31331）需要過濾或處理
- 使用資料區間限制或百分比位數法處理極端值

### 2. 圖表顏色一致性
- 延續現有圖表的配色方案
- 使用 `var(--primary)`, `var(--success)`, `var(--danger)` 等 CSS 變數

### 3. 效能優化
- 圖表使用 `React.memo` 避免不必要的重新渲染
- 資料轉換邏輯抽成獨立函式，便於測試

### 4. 響應式設計
- 桌面版: 左右佈局 (25% / 75%)
- 平板版: 上下佈局，圖表網格變 1 欄
- 手機版: 上下佈局，圖表網格變 1 欄
