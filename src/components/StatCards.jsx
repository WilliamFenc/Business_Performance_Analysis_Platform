import { useMemo } from 'react';

function StatCards({ companyName, labels, revenue, profit }) {
  const stats = useMemo(() => {
    if (!labels || labels.length === 0) {
      return {
        avgRev: '--',
        avgProfit: '--',
        avgMargin: '--',
        yearCount: 0,
      };
    }

    const sumRev = revenue.reduce((a, b) => a + b, 0);
    const sumPro = profit.reduce((a, b) => a + b, 0);
    const count = labels.length;

    const avgRev = Math.round(sumRev / count).toLocaleString();
    const avgPro = Math.round(sumPro / count).toLocaleString();
    let avgMar = '0.0%';
    if (sumRev > 0) avgMar = ((sumPro / sumRev) * 100).toFixed(1) + '%';

    return { avgRev, avgProfit: avgPro, avgMar, yearCount: count };
  }, [labels, revenue, profit]);

  return (
    <div className="header-stats">
      <div className="stat-card">
        <h3>公司名稱</h3>
        <div className="value" style={{ fontSize: '20px', color: '#333', marginTop: '15px' }}>
          {companyName || '--'}
        </div>
      </div>
      <div className="stat-card">
        <h3>{stats.yearCount}年平均營收</h3>
        <div className="value">
          {stats.avgRev} <span className="stat-unit">百萬</span>
        </div>
      </div>
      <div className="stat-card">
        <h3>{stats.yearCount}年平均淨利</h3>
        <div className="value">
          {stats.avgProfit} <span className="stat-unit">百萬</span>
        </div>
      </div>
      <div className="stat-card">
        <h3>{stats.yearCount}年平均淨利率</h3>
        <div className="value">{stats.avgMar}</div>
        <div className="stat-unit" style={{ fontSize: '12px' }}>(總淨利/總營收)</div>
      </div>
    </div>
  );
}

export default StatCards;
