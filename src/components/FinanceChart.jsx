import { useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';

/**
 * FinanceChart - 使用 Nivo 建立混合圖表
 * 使用單一 ResponsiveBar + 自訂 layer 繪製折線圖
 * 確保長條圖與折線圖完美對齊
 */
function FinanceChart({ labels, revenue, profit, selectedYear, onYearChange }) {

  /**
   * 根據長條圖實測位置返回標籤應該對齊的百分比位置
   * 測量結果（相對於標籤容器 margin-values-compact）：
   * - Index 0 (2020): -4%
   * - Index 1 (2021): 19.2%
   * - Index 2 (2022): 42.3%
   * - Index 3 (2023): 65.4%
   * - Index 4 (2024): 88.6%
   */
  const getBarCenterPosition = (index) => {
    const positions = [-4, 19.2, 42.3, 65.4, 88.6];
    return positions[index] || ((index + 0.5) * 20); // 降級處理：如果索引超出範圍，使用原來的計算方式
  };
  // 準備長條圖資料（營收）
  const barData = useMemo(() => {
    if (!labels || !revenue) return [];
    return labels.map((year, index) => ({
      year,
      revenue: revenue[index],
      profit: profit[index], // 加入 profit 以便在 layer 中使用
    }));
  }, [labels, revenue, profit]);

  // 淨利率資料
  const margins = useMemo(() => {
    if (!labels || !revenue || !profit) return [];
    return labels.map((year, i) => ({
      year,
      margin: revenue[i] > 0 ? ((profit[i] / revenue[i]) * 100).toFixed(1) + '%' : '0.0%',
    }));
  }, [labels, revenue, profit]);

  // 計算 Y 軸範圍（支援正負值）
  const maxProfit = useMemo(() => {
    if (!profit || profit.length === 0) return 100;
    const maxVal = Math.max(...profit, 0);
    const minVal = Math.min(...profit, 0);
    const range = maxVal - minVal;
    return maxVal + range * 0.2;
  }, [profit]);

  const minProfit = useMemo(() => {
    if (!profit || profit.length === 0) return 0;
    const minVal = Math.min(...profit, 0);
    if (minVal >= 0) return 0;
    return minVal - Math.abs(minVal) * 0.2;
  }, [profit]);

  // 計算折線圖的 Y 軸範圍
  const lineMaxValue = useMemo(() => {
    return maxProfit * 3;
  }, [maxProfit]);

  // 自訂 Tooltip
  const BarTooltip = ({ id, value, index, color }) => {
    const year = labels[index];
    const rev = revenue[index];
    const pro = profit[index];
    const margin = rev > 0 ? ((pro / rev) * 100).toFixed(1) : '0.0';

    return (
      <div
        style={{
          background: 'white',
          padding: '12px 16px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: '#0f172a',
          fontSize: '13px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
          {year} 年度
        </div>
        <div style={{ color: '#64748b' }}>營收: <span style={{ color: '#0f172a', fontWeight: '600' }}>{Math.round(rev).toLocaleString()}</span> 百萬</div>
        <div style={{ color: '#64748b' }}>淨利: <span style={{ color: '#3b82f6', fontWeight: '600' }}>{Math.round(pro).toLocaleString()}</span> 百萬</div>
        <div style={{ color: '#64748b', marginTop: '4px' }}>淨利率: <span style={{ color: '#10b981', fontWeight: '600' }}>{margin}%</span></div>
      </div>
    );
  };

  if (!labels || labels.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>暂無資料</div>;
  }

  return (
    <div className="chart-nivo-wrapper">
      {/* 圖例 */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color legend-color-bar"></span>
          <span className="legend-label">營收</span>
        </div>
        <div className="legend-item">
          <span className="legend-color legend-color-line"></span>
          <span className="legend-label">淨利</span>
        </div>
      </div>

      {/* 單位標籤 */}
      <div className="chart-unit-label">單位：百萬元</div>

      {/* 單一圖表容器 */}
      <div className="chart-nivo-container">
        <ResponsiveBar
          data={barData}
          keys={['revenue']}
          indexBy="year"
          margin={{ top: 60, right: 20, bottom: 50, left: 65 }}
          padding={0.25}
          layout="vertical"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          innerPadding={0}
          borderRadius={6}
          colors={(bar) => {
            const isSelected = bar.data.year === selectedYear;
            return isSelected ? '#3b82f6' : '#94a3b8';
          }}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.2]],
          }}
          axisTop={null}
          axisRight={null}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            format: (value) => value.toLocaleString(),
            style: {
              tick: { fill: '#475569', fontSize: 12, fontWeight: '500' },
            },
          }}
          axisBottom={{
            tickSize: 0,
            tickPadding: 12,
            tickRotation: 0,
            style: {
              tick: { fill: '#475569', fontSize: 20, fontWeight: 600 },
            },
          }}
          enableGridY={true}
          gridYValues={5}
          gridYStyle={{
            stroke: '#f1f5f9',
            strokeWidth: 1,
            strokeDasharray: '4 4',
          }}
          enableLabel={false}
          animate={true}
          motionConfig="stiff"
          onClick={(node) => {
            onYearChange(node.data.year);
          }}
          tooltip={BarTooltip}
          layers={[
            'grid',
            'axes',
            'bars',
            'labels',
            'legends',
            // 自訂 layer：營收標籤
            ({ bars, xScale, yScale }) => {
              return bars.map((bar) => {
                const xPos = bar.x + bar.width / 2;
                const yPos = bar.y - 8;
                return (
                  <text
                    key={`label-${bar.data.year}`}
                    x={xPos}
                    y={yPos}
                    textAnchor="middle"
                    dominantBaseline="auto"
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      fill: '#475569',
                      fontFamily: "'DM Mono', 'Roboto Mono', monospace",
                    }}
                  >
                    {Math.round(bar.data.value).toLocaleString()}
                  </text>
                );
              });
            },
            // 自訂 layer：折線圖
            ({ bars, xScale, yScale, innerWidth, innerHeight }) => {
              if (!bars || bars.length === 0) return null;

              // 計算折線圖的 Y 軸 scale
              const lineYScale = (value) => {
                const range = lineMaxValue - minProfit;
                const normalized = (value - minProfit) / range;
                return innerHeight - (normalized * innerHeight);
              };

              // 計算每個點的位置（使用原始 profit 陣列）
              const points = bars.map((bar, index) => {
                const centerX = bar.x + bar.width / 2;
                const profitValue = profit[index] || 0;
                const centerY = lineYScale(profitValue);
                return {
                  x: centerX,
                  y: centerY,
                  value: profitValue,
                  year: bar.data.year,
                };
              });

              // 生成折线路徑（monotoneX 曲線）
              let pathD = '';
              if (points.length === 1) {
                pathD = `M ${points[0].x} ${points[0].y}`;
              } else if (points.length >= 2) {
                pathD = `M ${points[0].x} ${points[0].y}`;
                for (let i = 1; i < points.length; i++) {
                  // 使用簡單的直線連接（可改為曲線）
                  pathD += ` L ${points[i].x} ${points[i].y}`;
                }
              }

              return (
                <g key="line-layer">
                  {/* 折線 */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#e67e22"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ pointerEvents: 'none' }}
                  />
                  {/* 折線圖端點 */}
                  {points.map((point) => {
                    const isSelected = point.year === selectedYear;
                    const radius = isSelected ? 7 : 5;
                    return (
                      <g key={`point-${point.year}`}>
                        {/* 外圈（點擊區域） */}
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={radius + 8}
                          fill="transparent"
                          style={{ cursor: 'pointer' }}
                          onClick={() => onYearChange(point.year)}
                        />
                        {/* 白色內圈 */}
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={radius}
                          fill="#ffffff"
                          stroke="#e67e22"
                          strokeWidth={3}
                          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                          onClick={() => onYearChange(point.year)}
                        />
                        {/* 淨利數字標籤 */}
                        <text
                          x={point.x}
                          y={point.y - 12}
                          textAnchor="middle"
                          dominantBaseline="auto"
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fill: '#e67e22',
                            fontFamily: "'DM Mono', 'Roboto Mono', monospace",
                          }}
                        >
                          {Math.round(point.value).toLocaleString()}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            },
          ]}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 12,
                  fontWeight: 600,
                },
              },
            },
            tooltip: {
              container: {
                background: 'white',
                color: '#0f172a',
                fontSize: '13px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            },
          }}
        />
      </div>

      {/* 底部淨利率標籤區 - 精簡版 */}
      <div className="margin-labels-section-compact">
        <div className="margin-title-compact">淨利率%</div>
        <div className="margin-values-compact">
          {margins.map((item, index) => (
            <div
              key={item.year}
              className={`margin-value-compact ${item.year === selectedYear ? 'margin-value-active' : ''}`}
              onClick={() => onYearChange(item.year)}
              style={{
                position: 'absolute',
                left: `${getBarCenterPosition(index)}%` // 使用實測的長條圖中心位置：-4%, 19.2%, 42.3%, 65.4%, 88.6%
              }}
            >
              <div className="margin-percent-compact">{item.margin}</div>
              <div className="margin-year-compact">{item.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FinanceChart;
