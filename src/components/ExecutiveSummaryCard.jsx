import { useState, useEffect } from 'react';

const API_BASE = '/api';

function ExecutiveSummaryCard({ company, selectedYear }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 當公司或年度變更時重新載入
  useEffect(() => {
    if (company && selectedYear) {
      fetchAISummary();
    } else {
      // 清除狀態
      setSummary(null);
      setError(null);
    }
  }, [company, selectedYear]);

  const fetchAISummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/ai-summary?company=${encodeURIComponent(company)}&year=${selectedYear}`
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSummary(result.data.summary);
      } else {
        setError(result.error || '無法載入 AI 分析');
      }
    } catch (err) {
      console.error('載入 AI 摘要失敗:', err);
      setError('AI 分析服務暫時無法使用');
    } finally {
      setIsLoading(false);
    }
  };

  // 載入狀態
  if (isLoading) {
    return (
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-card-icon summary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.55-3 6v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3C6.19 13.55 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
              <path d="M9 21h6"></path>
            </svg>
          </div>
          <h3 className="kpi-card-title">綜合分析評論</h3>
        </div>
        <div className="kpi-card-content">
          <div className="ai-summary-loading">
            <div className="loading-spinner"></div>
            <span>AI 分析中...</span>
          </div>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-card-icon summary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.55-3 6v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3C6.19 13.55 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
              <path d="M9 21h6"></path>
            </svg>
          </div>
          <h3 className="kpi-card-title">綜合分析評論</h3>
        </div>
        <div className="kpi-card-content">
          <div className="ai-summary-error">
            <span>⚠️ {error}</span>
            <button onClick={fetchAISummary} className="retry-button">重新載入</button>
          </div>
        </div>
      </div>
    );
  }

  // 成功狀態
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div className="kpi-card-icon summary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.55-3 6v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3C6.19 13.55 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
            <path d="M9 21h6"></path>
          </svg>
        </div>
        <h3 className="kpi-card-title">綜合分析評論</h3>
      </div>
      <div className="kpi-card-content">
        <div className="ai-summary-content">
          {renderMarkdown(summary)}
        </div>
      </div>
    </div>
  );
}

// 將含「建議查核人員」的文字段落，從該詞起轉為粗體
function renderWithBold(text) {
  if (!text) return text;
  const keyword = '建議查核人員';
  const boldIndex = text.indexOf(keyword);
  if (boldIndex === -1) return text;
  return (
    <>
      {text.slice(0, boldIndex)}
      <strong>{text.slice(boldIndex)}</strong>
    </>
  );
}

// 簡單的 Markdown 渲染函式
function renderMarkdown(text) {
  if (!text) return null;

  // 分段處理
  const paragraphs = text.split('\n\n');

  return paragraphs.map((paragraph, idx) => {
    // 處理標題 【XXX】
    if (paragraph.startsWith('【') && paragraph.endsWith('】')) {
      const title = paragraph;
      return <h4 key={idx} className="ai-summary-section-title">{title}</h4>;
    }

    // 處理清單項目
    const lines = paragraph.split('\n');
    if (lines.some(line => line.match(/^\d+\./) || line.match(/^-\s/))) {
      return (
        <ul key={idx} className="ai-summary-list">
          {lines.map((line, lineIdx) => {
            if (line.match(/^\d+\./)) {
              return <li key={lineIdx}>{renderWithBold(line.replace(/^\d+\.\s*/, ''))}</li>;
            }
            if (line.match(/^-\s/)) {
              return <li key={lineIdx}>{renderWithBold(line.replace(/^-\s*/, ''))}</li>;
            }
            return <p key={lineIdx}>{line}</p>;
          })}
        </ul>
      );
    }

    // 一般段落
    return <p key={idx}>{renderWithBold(paragraph)}</p>;
  });
}

export default ExecutiveSummaryCard;
