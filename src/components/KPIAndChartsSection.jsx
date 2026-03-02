import { useState, useEffect, useCallback } from 'react';
import ExecutiveSummaryCard from './ExecutiveSummaryCard';
import PositiveIndicatorsCard from './PositiveIndicatorsCard';
import ConcernIndicatorsCard from './ConcernIndicatorsCard';
import ProfitabilityChart from './ProfitabilityChart';
import SolvencyChart from './SolvencyChart';
import AREfficiencyChart from './AREfficiencyChart';
import InventoryChart from './InventoryChart';
import GrowthChart from './GrowthChart';
import ExpenseTrendChart from './ExpenseTrendChart';

// API 基礎 URL
const API_BASE = '/api';

/**
 * KPI 和圖表區塊容器組件
 * 包含左側 KPI 分析面板和右側 6 張圖表
 * @param {string} company - 公司名稱
 * @param {string} selectedYear - 選擇的年度（可選，未提供時使用最新年度）
 */
function KPIAndChartsSection({ company, selectedYear }) {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 取得財務指標資料
  const fetchFinancialBasics = useCallback(async (companyName) => {
    if (!companyName) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/financial/basics?company=${encodeURIComponent(companyName)}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setMetrics(result.data.metrics);
        } else {
          setMetrics(null);
        }
      } else {
        throw new Error('無法載入財務指標資料');
      }
    } catch (err) {
      console.error('載入財務指標失敗:', err);
      setError(err.message);
      setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 當公司變更時重新載入
  useEffect(() => {
    fetchFinancialBasics(company);
  }, [company, fetchFinancialBasics]);

  // 載入狀態
  if (isLoading) {
    return (
      <div className="kpi-charts-section">
        <div className="kpi-panel-loading">
          <div className="loading-spinner"></div>
          <span>載入 KPI 分析中...</span>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="kpi-charts-section">
        <div className="kpi-panel-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  // 無資料狀態 - 不顯示任何內容
  if (!metrics || !metrics.years || metrics.years.length === 0) {
    return null;
  }

  return (
    <div className="kpi-charts-section">
      {/* 左側 KPI 區域 - 25% 寬度 */}
      <div className="kpi-panel">
        <ExecutiveSummaryCard company={company} selectedYear={selectedYear} />
        <PositiveIndicatorsCard metrics={metrics} selectedYear={selectedYear} />
        <ConcernIndicatorsCard metrics={metrics} selectedYear={selectedYear} />
      </div>

      {/* 右側圖表區域 - 75% 寬度 */}
      <div className="charts-grid">
        <div className="chart-item">
          <ProfitabilityChart metrics={metrics} />
        </div>
        <div className="chart-item">
          <SolvencyChart metrics={metrics} />
        </div>
        <div className="chart-item">
          <AREfficiencyChart metrics={metrics} />
        </div>
        <div className="chart-item">
          <InventoryChart metrics={metrics} />
        </div>
        <div className="chart-item">
          <GrowthChart metrics={metrics} />
        </div>
        <div className="chart-item">
          <ExpenseTrendChart metrics={metrics} />
        </div>
      </div>
    </div>
  );
}

export default KPIAndChartsSection;
