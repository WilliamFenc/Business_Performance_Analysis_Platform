import React from 'react';
import InsightPanel from './InsightPanel';
import FinanceChart from './FinanceChart';

/**
 * InsightChartSection - 績效洞察與圖表並排區塊
 * 25:75 比例左右配置，與下方 KPIAndChartsSection 對齊
 * 響應式設計：小螢幕時自動切換為上下配置
 */
function InsightChartSection({ labels, revenue, profit, selectedYear, onYearChange }) {
  return (
    <div className="insight-chart-section">
      {/* 左側：績效洞察面板 (25%) */}
      <div className="insight-panel-wrapper">
        <InsightPanel
          labels={labels}
          revenue={revenue}
          profit={profit}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
        />
      </div>

      {/* 右側：營收-淨利圖表 (75%) */}
      <div className="chart-panel-wrapper">
        <FinanceChart
          labels={labels}
          revenue={revenue}
          profit={profit}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
        />
      </div>
    </div>
  );
}

export default InsightChartSection;
