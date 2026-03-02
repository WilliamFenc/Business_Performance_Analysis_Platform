/**
 * 風險/關注指標卡片
 * 根據「財務分析指標.xlsx > 財務比率說明」的判斷邏輯自動識別風險指標
 */

// 輔助函式：根據選擇年度取得年度索引
function getYearIndex(metrics, selectedYear) {
  if (!selectedYear || !metrics.years) return metrics.years.length - 1;
  const idx = metrics.years.indexOf(selectedYear);
  return idx !== -1 ? idx : metrics.years.length - 1;
}

// 輔助函式：取得選擇年度資料（支援 selectedYear）
function getSelectedYearData(metrics, selectedYear) {
  const idx = getYearIndex(metrics, selectedYear);
  return {
    year: metrics.years[idx],
    netProfitMargin: metrics.netProfitMargin[idx],
    grossMargin: metrics.grossMargin[idx],
    roa: metrics.roa[idx],
    currentRatio: metrics.currentRatio[idx],
    quickRatio: metrics.quickRatio[idx],
    debtEquityRatio: metrics.debtEquityRatio[idx],
    arTurnover: metrics.arTurnover[idx],
    inventoryTurnover: metrics.inventoryTurnover[idx],
    revenueGrowth: metrics.revenueGrowth[idx],
    grossProfitGrowth: metrics.grossProfitGrowth[idx],
    profitBeforeTaxGrowth: metrics.profitBeforeTaxGrowth[idx],
    sellingExpenseRatio: metrics.sellingExpenseRatio[idx],
    adminExpenseRatio: metrics.adminExpenseRatio[idx],
    rdExpenseRatio: metrics.rdExpenseRatio[idx],
  };
}

// 輔助函式：取得前一年度資料（根據選擇年度）
function getPreviousYearData(metrics, selectedYear) {
  const idx = getYearIndex(metrics, selectedYear);
  const prevIndex = idx - 1;
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

// 輔助函式：檢查從選擇年度往前的連續 n 年正成長
function isPositiveGrowth(metrics, metricKey, selectedYear, requiredYears = 3) {
  const idx = getYearIndex(metrics, selectedYear);
  const startIndex = Math.max(0, idx - requiredYears + 1);
  const values = metrics[metricKey].slice(startIndex, idx + 1);

  // 必須有足夠的年數才能判斷「連續 n 年」
  if (values.length < requiredYears) return false;

  for (let i = 1; i < values.length; i++) {
    if (values[i] === null || values[i - 1] === null) return false;
    if (values[i] <= values[i - 1]) return false;
  }
  return true;
}

// 輔助函式：檢查從選擇年度往前的連續 n 年負成長
function isNegativeGrowth(metrics, metricKey, selectedYear, requiredYears = 3) {
  const idx = getYearIndex(metrics, selectedYear);
  const startIndex = Math.max(0, idx - requiredYears + 1);
  const values = metrics[metricKey].slice(startIndex, idx + 1);

  // 必須有足夠的年數才能判斷「連續 n 年」
  if (values.length < requiredYears) return false;

  for (let i = 1; i < values.length; i++) {
    if (values[i] === null || values[i - 1] === null) return false;
    if (values[i] >= values[i - 1]) return false;
  }
  return true;
}

// 輔助函式：檢查從選擇年度往前的連續 n 年皆低於某值
function isBelowThreshold(metrics, metricKey, threshold, selectedYear, requiredYears = 3) {
  const idx = getYearIndex(metrics, selectedYear);
  const startIndex = Math.max(0, idx - requiredYears + 1);
  const values = metrics[metricKey].slice(startIndex, idx + 1);

  // 必須有足夠的年數才能判斷「連續 n 年」
  if (values.length < requiredYears) return false;

  return values.every(v => v != null && v < threshold);
}

// 輔助函式：安全數值比較
function safeValue(val) {
  return val === null || val === undefined ? null : val;
}

// 輔助函式：格式化數值
function formatValue(value, unit = '') {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return value.toFixed(1) + unit;
  }
  return value + unit;
}

/**
 * 計算風險指標
 * @param {Object} metrics - 財務指標資料
 * @param {string} selectedYear - 選擇的年度（可選）
 */
function getConcernIndicators(metrics, selectedYear) {
  const latest = getSelectedYearData(metrics, selectedYear);
  const previous = getPreviousYearData(metrics, selectedYear);
  const concerns = [];

  // 1. 淨利率: 小於0%
  if (safeValue(latest.netProfitMargin) < 0) {
    concerns.push({
      metric: '淨利率',
      value: latest.netProfitMargin,
      unit: '%',
      criteria: '<0%',
      reason: '虧損',
      level: 'critical'
    });
  }

  // 2. 淨利率: 前一年度>0%，本年度<0% (轉盈為虧)
  if (previous && safeValue(previous.netProfitMargin) > 0 && safeValue(latest.netProfitMargin) < 0) {
    concerns.push({
      metric: '淨利率',
      value: latest.netProfitMargin,
      unit: '%',
      criteria: '轉盈為虧',
      reason: '由盈轉虧',
      level: 'critical'
    });
  }

  // 3. 淨利率: 連續三年以上<0%
  if (isBelowThreshold(metrics, 'netProfitMargin', 0, selectedYear, 3)) {
    concerns.push({
      metric: '淨利率',
      value: latest.netProfitMargin,
      unit: '%',
      criteria: '連續三年以上虧損',
      reason: '長期虧損',
      level: 'critical'
    });
  }

  // 4. 毛利率: 小於0%
  if (safeValue(latest.grossMargin) < 0) {
    concerns.push({
      metric: '毛利率',
      value: latest.grossMargin,
      unit: '%',
      criteria: '<0%',
      reason: '毛利為負',
      level: 'critical'
    });
  }

  // 5. 毛利率: 本年度 < 前一年度
  if (previous && safeValue(latest.grossMargin) < safeValue(previous.grossMargin)) {
    concerns.push({
      metric: '毛利率',
      value: latest.grossMargin,
      unit: '%',
      criteria: '衰退',
      reason: '毛利率下滑'
    });
  }

  // 6. ROA: 小於5%
  if (safeValue(latest.roa) < 5 && safeValue(latest.roa) !== null) {
    concerns.push({
      metric: 'ROA',
      value: latest.roa,
      unit: '%',
      criteria: '<5%',
      reason: '資產報酬率偏低'
    });
  }

  // 7. ROA: 小於0%
  if (safeValue(latest.roa) < 0) {
    concerns.push({
      metric: 'ROA',
      value: latest.roa,
      unit: '%',
      criteria: '<0%',
      reason: '資產報酬率為負',
      level: 'critical'
    });
  }

  // 8. 流動比率: 小於1
  if (safeValue(latest.currentRatio) < 100) {
    concerns.push({
      metric: '流動比率',
      value: latest.currentRatio / 100,
      unit: '',
      criteria: '<1',
      reason: '短期償債能力不足'
    });
  }

  // 9. 流動比率: 前一年度>1，本年度<1
  if (previous && safeValue(previous.currentRatio) > 100 && safeValue(latest.currentRatio) < 100) {
    concerns.push({
      metric: '流動比率',
      value: latest.currentRatio / 100,
      unit: '',
      criteria: '惡化',
      reason: '流動比率惡化'
    });
  }

  // 10. 速動比率: 小於0.8
  if (safeValue(latest.quickRatio) < 80) {
    concerns.push({
      metric: '速動比率',
      value: latest.quickRatio / 100,
      unit: '',
      criteria: '<0.8',
      reason: '速動資產不足'
    });
  }

  // 11. 速動比率: 前一年度>0.8，本年度<0.8
  if (previous && safeValue(previous.quickRatio) > 80 && safeValue(latest.quickRatio) < 80) {
    concerns.push({
      metric: '速動比率',
      value: latest.quickRatio / 100,
      unit: '',
      criteria: '惡化',
      reason: '速動比率惡化'
    });
  }

  // 12. 負債淨值比: 大於200%
  if (safeValue(latest.debtEquityRatio) > 200) {
    concerns.push({
      metric: '負債淨值比',
      value: latest.debtEquityRatio / 100,
      unit: '',
      criteria: '>200%',
      reason: '槓桿比例偏高'
    });
  }

  // 13. 負債淨值比: 連續三年皆呈現正成長 (負債持續增加)
  if (isPositiveGrowth(metrics, 'debtEquityRatio', selectedYear, 3)) {
    concerns.push({
      metric: '負債淨值比',
      value: latest.debtEquityRatio / 100,
      unit: '',
      criteria: '連續三年正成長',
      reason: '負債持續增加'
    });
  }

  // 14. 應收帳款週轉率: 小於4
  if (safeValue(latest.arTurnover) < 4 && safeValue(latest.arTurnover) !== null) {
    concerns.push({
      metric: '應收週轉',
      value: latest.arTurnover,
      unit: '次',
      criteria: '<4次',
      reason: '收款效率偏低'
    });
  }

  // 15. 應收帳款週轉率: 連續三年皆呈現負成長
  if (isNegativeGrowth(metrics, 'arTurnover', selectedYear, 3)) {
    concerns.push({
      metric: '應收週轉',
      value: latest.arTurnover,
      unit: '次',
      criteria: '連續三年負成長',
      reason: '收款效率持續下降'
    });
  }

  // 16. 存貨周轉率: 小於2
  if (safeValue(latest.inventoryTurnover) < 2 && safeValue(latest.inventoryTurnover) !== null) {
    concerns.push({
      metric: '存貨周轉',
      value: latest.inventoryTurnover,
      unit: '次',
      criteria: '<2次',
      reason: '存貨周轉偏低'
    });
  }

  // 17. 存貨周轉率: 連續三年皆呈現負成長
  if (isNegativeGrowth(metrics, 'inventoryTurnover', selectedYear, 3)) {
    concerns.push({
      metric: '存貨周轉',
      value: latest.inventoryTurnover,
      unit: '次',
      criteria: '連續三年負成長',
      reason: '存貨周轉持續下降'
    });
  }

  // 18. 營收成長率: 小於0%
  if (safeValue(latest.revenueGrowth) < 0) {
    concerns.push({
      metric: '營收成長',
      value: latest.revenueGrowth,
      unit: '%',
      criteria: '<0%',
      reason: '營收衰退'
    });
  }

  // 19. 營收成長率: 連續三年<0%
  if (isBelowThreshold(metrics, 'revenueGrowth', 0, selectedYear, 3)) {
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
  if (isNegativeGrowth(metrics, 'grossProfitGrowth', selectedYear, 3)) {
    concerns.push({
      metric: '毛利成長',
      value: latest.grossProfitGrowth,
      unit: '%',
      criteria: '連續三年負成長',
      reason: '毛利持續衰退'
    });
  }

  // 21. 毛利成長率: 衰退幅度超過5%
  if (safeValue(latest.grossProfitGrowth) < -5) {
    concerns.push({
      metric: '毛利成長',
      value: latest.grossProfitGrowth,
      unit: '%',
      criteria: '<-5%',
      reason: '毛利大幅衰退'
    });
  }

  // 22. 稅前淨利成長率: 連續三年皆呈現負成長
  if (isNegativeGrowth(metrics, 'profitBeforeTaxGrowth', selectedYear, 3)) {
    concerns.push({
      metric: '稅前淨利成長',
      value: latest.profitBeforeTaxGrowth,
      unit: '%',
      criteria: '連續三年負成長',
      reason: '獲利持續衰退'
    });
  }

  // 23. 稅前淨利成長率: 衰退幅度超過5%
  if (safeValue(latest.profitBeforeTaxGrowth) < -5) {
    concerns.push({
      metric: '稅前淨利成長',
      value: latest.profitBeforeTaxGrowth,
      unit: '%',
      criteria: '<-5%',
      reason: '獲利大幅衰退'
    });
  }

  // 24. 推銷費用占比: 占比超過5%
  if (safeValue(latest.sellingExpenseRatio) > 5) {
    concerns.push({
      metric: '推銷費用占比',
      value: latest.sellingExpenseRatio,
      unit: '%',
      criteria: '>5%',
      reason: '推銷費用偏高'
    });
  }

  // 25. 推銷費用占比: 連續三年皆呈現正成長
  if (isPositiveGrowth(metrics, 'sellingExpenseRatio', selectedYear, 3)) {
    concerns.push({
      metric: '推銷費用占比',
      value: latest.sellingExpenseRatio,
      unit: '%',
      criteria: '連續三年正成長',
      reason: '推銷費用持續上升'
    });
  }

  // 26. 推銷費用占比: 相較去年度成長超過3%
  if (previous && (safeValue(latest.sellingExpenseRatio) - safeValue(previous.sellingExpenseRatio) > 3)) {
    concerns.push({
      metric: '推銷費用占比',
      value: latest.sellingExpenseRatio,
      unit: '%',
      criteria: '年增>3%',
      reason: '推銷費用快速上升'
    });
  }

  // 27. 管理費用佔比: 占比超過5%
  if (safeValue(latest.adminExpenseRatio) > 5) {
    concerns.push({
      metric: '管理費用佔比',
      value: latest.adminExpenseRatio,
      unit: '%',
      criteria: '>5%',
      reason: '管理費用偏高'
    });
  }

  // 28. 管理費用佔比: 連續三年皆呈現正成長
  if (isPositiveGrowth(metrics, 'adminExpenseRatio', selectedYear, 3)) {
    concerns.push({
      metric: '管理費用佔比',
      value: latest.adminExpenseRatio,
      unit: '%',
      criteria: '連續三年正成長',
      reason: '管理費用持續上升'
    });
  }

  // 29. 管理費用佔比: 相較去年度成長超過3%
  if (previous && (safeValue(latest.adminExpenseRatio) - safeValue(previous.adminExpenseRatio) > 3)) {
    concerns.push({
      metric: '管理費用佔比',
      value: latest.adminExpenseRatio,
      unit: '%',
      criteria: '年增>3%',
      reason: '管理費用快速上升'
    });
  }

  // 30. 研發費用佔比: 占比超過5%
  if (safeValue(latest.rdExpenseRatio) > 5) {
    concerns.push({
      metric: '研發費用佔比',
      value: latest.rdExpenseRatio,
      unit: '%',
      criteria: '>5%',
      reason: '研發費用偏高'
    });
  }

  // 31. 研發費用佔比: 連續三年皆呈現正成長
  if (isPositiveGrowth(metrics, 'rdExpenseRatio', selectedYear, 3)) {
    concerns.push({
      metric: '研發費用佔比',
      value: latest.rdExpenseRatio,
      unit: '%',
      criteria: '連續三年正成長',
      reason: '研發費用持續上升'
    });
  }

  // 32. 研發費用佔比: 相較去年度成長超過3%
  if (previous && (safeValue(latest.rdExpenseRatio) - safeValue(previous.rdExpenseRatio) > 3)) {
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

function ConcernIndicatorsCard({ metrics, selectedYear }) {
  if (!metrics || !metrics.years || metrics.years.length === 0) {
    return null;
  }

  const concerns = getConcernIndicators(metrics, selectedYear);

  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div className="kpi-card-icon concern">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.71L12 17.59l8.47-7.88a2 2 0 0 1 2.83-2.83z"></path>
            <line x1="12" y1="9" x2="12" y2="17"></line>
            <line x1="8" y1="13" x2="16" y2="13"></line>
          </svg>
        </div>
        <h3 className="kpi-card-title">風險/關注指標</h3>
      </div>
      <div className="kpi-card-content">
        {concerns.length === 0 ? (
          <div className="indicator-empty">尚無風險指標</div>
        ) : (
          <ul className="indicator-list">
            {concerns.map((item, index) => (
              <li key={index} className="indicator-item">
                <div className="indicator-item-header">
                  <span className="indicator-name">{item.metric}</span>
                  <span className={`indicator-value ${item.level === 'critical' ? 'concern' : 'warning'}`} style={{ marginLeft: '8px' }}>
                    {formatValue(item.value, item.unit)}
                  </span>
                </div>
                <div className="indicator-reason">
                  <span className="indicator-criteria">{item.criteria}</span>
                  {' · '}{item.reason}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ConcernIndicatorsCard;
