/**
 * 圖表工具函式
 */

/**
 * 將 metrics 資料轉換為 Nivo 圖表格式
 */
export function transformMetricsToNivoData(metrics, metricKeys, yearLabels) {
  return metricKeys.map(key => ({
    id: key,
    data: yearLabels.map((year, index) => ({
      x: year,
      y: metrics[key]?.[index] ?? null,
    })),
  }));
}

/**
 * 取得圖表圖例顏色
 */
export function getChartColors(scheme = 'category10') {
  const colors = {
    category10: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    financial: ['#3b82f6', '#10b981', '#f59e0b'],
    growth: ['#10b981', '#ef4444', '#f59e0b'],
    solvency: ['#8b5cf6', '#3b82f6', '#ef4444'],
    expense: ['#f59e0b', '#ef4444', '#10b981'],
  };
  return colors[scheme] || colors.category10;
}

/**
 * 格式化數值
 */
export function formatValue(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  return value.toFixed(decimals);
}

/**
 * 處理異常值 - 過濾極端值
 */
export function filterOutliers(values, multiplier = 3) {
  if (!values || values.length === 0) return values;

  const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (validValues.length === 0) return values;

  const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  const stdDev = Math.sqrt(
    validValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validValues.length
  );

  const upperBound = mean + multiplier * stdDev;

  return values.map(v => (v > upperBound ? null : v));
}

/**
 * 生成圖表常用的配置
 */
export function getCommonChartConfig() {
  return {
    margin: { top: 20, right: 20, bottom: 40, left: 50 },
    axisBottom: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: '',
      legendOffset: -40,
      truncateTickAt: 0,
    },
    axisLeft: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: '',
      legendOffset: -40,
      truncateTickAt: 0,
    },
    theme: {
      axis: {
        ticks: {
          text: {
            fill: '#64748b',
            fontSize: 11,
          },
        },
        legend: {
          text: {
            fill: '#64748b',
            fontSize: 12,
            fontWeight: 500,
          },
        },
      },
      grid: {
        line: {
          stroke: '#e2e8f0',
          strokeWidth: 1,
        },
      },
      tooltip: {
        container: {
          background: '#ffffff',
          color: '#1e293b',
          fontSize: 13,
          borderRadius: '4px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };
}
