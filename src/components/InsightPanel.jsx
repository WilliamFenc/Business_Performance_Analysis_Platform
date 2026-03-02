import { useMemo, Fragment } from 'react';

function InsightPanel({ labels, revenue, profit, selectedYear, onYearChange }) {
  const availableYears = useMemo(() => {
    if (!labels) return [];
    return [...labels].reverse();
  }, [labels]);

  const summaryContent = useMemo(() => {
    if (!selectedYear || !labels || !revenue || !profit) {
      return <div>請選擇年份查看分析...</div>;
    }

    const idx = labels.indexOf(selectedYear);
    if (idx === -1) return <div>暫無數據</div>;

    const curRev = revenue[idx];
    const curPro = profit[idx];
    const curMar = (curPro / curRev * 100).toFixed(1);

    const iconUp = (
      <svg className="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    );
    const iconDown = (
      <svg className="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>
    );

    // 基準年度（第一年）
    if (idx === 0) {
      return (
        <div>
          本期 ({selectedYear}) 為基準年度。營收 <strong>{curRev.toLocaleString()}</strong> 百萬，淨利 <strong>{curPro.toLocaleString()}</strong> 百萬。
        </div>
      );
    }

    // 比較年度（與前一年比較）
    const prevRev = revenue[idx - 1];
    const prevPro = profit[idx - 1];
    const prevMar = (prevPro / prevRev * 100).toFixed(1);
    const revDiff = curRev - prevRev;
    const proDiff = curPro - prevPro;
    const marDiff = (curMar - prevMar).toFixed(1);
    const rClass = revDiff >= 0 ? 'highlight-green' : 'highlight-red';
    const rIcon = revDiff >= 0 ? iconUp : iconDown;
    const rPct = ((revDiff / prevRev) * 100).toFixed(1) + '%';
    const pClass = proDiff >= 0 ? 'highlight-green' : 'highlight-red';
    const pIcon = proDiff >= 0 ? iconUp : iconDown;
    const pPct = ((proDiff / Math.abs(prevPro)) * 100).toFixed(1) + '%';

    let marText = '';
    if (marDiff > 0) marText = '增加至';
    else if (marDiff < 0) marText = '減少至';
    else marText = '持平於';

    return (
      <Fragment>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', color: '#78350f' }}>營收分析</div>
          <div>
            <span className={rClass}>{rIcon} {revDiff >= 0 ? '成長' : '下滑'} {Math.round(Math.abs(revDiff)).toLocaleString()} 百萬</span>
            <span style={{ fontSize: '0.9em', color: '#888' }}>(YoY: {rPct})</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', color: '#78350f' }}>獲利能力</div>
          <div>
            <span className={pClass}>{pIcon} 淨利{proDiff >= 0 ? '增加' : '減少'} {Math.round(Math.abs(proDiff)).toLocaleString()} 百萬</span>
            <span style={{ fontSize: '0.9em', color: '#888' }}>(YoY: {pPct})</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#78350f' }}>淨利率</div>
          <div>由 {prevMar}% <strong>{marText} {curMar}%</strong>。</div>
        </div>
      </Fragment>
    );
  }, [selectedYear, labels, revenue, profit]);

  return (
    <div className="annotation">
      <div className="insight-header">
        <div className="insight-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.55-3 6v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3C6.19 13.55 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
            <path d="M9 21h6"></path>
          </svg>
          績效洞察 (Performance Insight)
        </div>
        <div className="year-select-container">
          <label style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>分析年度：</label>
          <select
            id="yearSelector"
            className="year-select"
            value={selectedYear || ''}
            onChange={(e) => onYearChange(e.target.value)}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year} 年度
              </option>
            ))}
          </select>
          <span id="pdfYearLabel" className="pdf-year-label"></span>
        </div>
      </div>
      <div id="summaryText" className="insight-content">
        {summaryContent}
      </div>
    </div>
  );
}

export default InsightPanel;
