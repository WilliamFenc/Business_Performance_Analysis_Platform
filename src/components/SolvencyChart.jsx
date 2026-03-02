import { useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';

/**
 * 償債結構圖表 (Solvency)
 * 顯示流動比率（長條圖）、負債比（折線圖）的趨勢
 * 使用雙 Y 軸設計
 */
function SolvencyChart({ metrics }) {
  if (!metrics || !metrics.years || metrics.years.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">無資料</div>
      </div>
    );
  }

  // 準備資料
  const chartData = useMemo(() => {
    return metrics.years.map((year, index) => ({
      year: year,
      yearIndex: index,
      // 流動比用長條圖顯示
      currentRatio: metrics.currentRatio?.[index] !== null ? metrics.currentRatio[index] / 100 : null,
      // 負債比用折線圖顯示
      debtRatio: metrics.debtEquityRatio?.[index] !== null ? metrics.debtEquityRatio[index] / 100 : null,
    }));
  }, [metrics]);

  // 流動比的最大值
  const maxCurrentRatio = useMemo(() => {
    const values = chartData.map(d => d.currentRatio).filter(v => v !== null && !isNaN(v));
    return Math.max(...values, 0.1) * 1.2;
  }, [chartData]);

  // 負債比的最大值
  const maxDebtRatio = useMemo(() => {
    const values = chartData.map(d => d.debtRatio).filter(v => v !== null && !isNaN(v));
    return Math.max(...values, 0.1) * 1.2;
  }, [chartData]);

  // 自訂 layer - 繪製長條圖和折線圖
  const CustomLayer = ({ bars, xScale, yScale, innerHeight, innerWidth }) => {
    if (!bars || bars.length === 0) return null;

    try {
      // 創建折線圖專用的 Y 軸 scale（基於 maxDebtRatio）
      const debtRatioScale = d3ScaleLinear()
        .range([innerHeight, 0])  // Y 軸從下到上
        .domain([0, maxDebtRatio]);

      // 1. 繪製流動比長條圖（綠色）
      const barElements = bars
        .filter(bar => bar.key && bar.key.toString().startsWith('currentRatio'))
        .map((bar) => {
          // 添加長條圖數值標籤
          const dataValue = chartData[bar.index]?.currentRatio;
          return (
            <g key={`bar-group-${bar.index}`}>
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill="#10b981"
                rx={4}
                ry={4}
              />
              {/* 長條圖數值標籤 */}
              {dataValue !== null && dataValue !== undefined && (
                <text
                  x={bar.x + bar.width / 2}
                  y={bar.y + bar.height / 2 + 4}
                  textAnchor="middle"
                  fill="#000"
                  fontSize={11}
                  fontWeight="bold"
                >
                  {dataValue.toFixed(2)}
                </text>
              )}
            </g>
          );
        });

      // 2. 繪製負債比折線圖（橙色），對齊到長條圖中心
      // 使用 debtRatioScale 來計算 Y 座標
      const linePoints = chartData
        .map((d, i) => {
          if (d.debtRatio === null) return null;

          // 使用對應 bar 的位置來計算 x 座標（長條圖中心）
          const targetBar = bars.find(b => b.index === i);
          if (!targetBar) return null;

          const x = targetBar.x + targetBar.width / 2;
          // 使用 debtRatioScale 而不是 yScale
          const y = debtRatioScale(d.debtRatio);

          return {
            x,
            y,
            value: d.debtRatio,
            year: d.year,
          };
        })
        .filter(p => p !== null && p.y !== undefined && !isNaN(p.y) && p.x !== undefined);

      // 如果沒有足夠的折線圖點，只返回長條圖
      if (linePoints.length < 1) {
        return <g>{barElements}</g>;
      }

      // 生成折線路徑
      const pathD = linePoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
        .join(' ');

      // 3. 折線圖元素
      const lineElements = (
        <g style={{ pointerEvents: 'none' }}>
          <path
            d={pathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ mixBlendMode: 'multiply' }}
          />
          {linePoints.map((p) => (
            <g key={`line-point-${p.year}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fill="#d97706"
                fontSize={12}
                fontWeight="bold"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                {p.value.toFixed(2)}
              </text>
            </g>
          ))}
        </g>
      );

      return <g>{barElements}{lineElements}</g>;
    } catch (error) {
      console.error('CustomLayer error:', error);
      return null;
    }
  };

  return (
    <div className="chart-container" style={{ height: '320px', position: 'relative' }}>
      <div className="chart-header">
        <h4 className="chart-title">償債結構 (Solvency)</h4>
      </div>

      {/* 使用統一的 ResponsiveBar */}
      <div style={{ position: 'absolute', top: 60, left: 20, right: 40, bottom: 60 }}>
        <ResponsiveBar
          data={chartData}
          keys={['currentRatio']}  // 只用流動比來生成 bars
          indexBy="year"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          yScale={{
            type: 'linear',
            min: 0,
            max: maxCurrentRatio,
          }}
          axisLeft={null}
          axisRight={null}
          axisBottom={null}
          enableGridX={false}
          enableGridY={false}
          colors={['#10b981']}
          borderRadius={4}
          barPadding={0.3}
          tooltip={({ id, value }) => (
            <div style={{ padding: '8px', background: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <strong>流動比</strong>: {value !== null ? value.toFixed(2) : '-'}
            </div>
          )}
          layers={['grid', 'axes', CustomLayer]}
        />
      </div>

      {/* X 軸標籤 */}
      <div style={{
        position: 'absolute',
        left: 20,
        right: 40,
        bottom: 40,
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '11px',
        color: '#64748b'
      }}>
        {chartData.map(d => (
          <div key={d.year}>{d.year}</div>
        ))}
      </div>

      {/* 圖例 */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: '2px' }}></div>
          <span>流動比</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
          <span>負債比</span>
        </div>
      </div>
    </div>
  );
}

export default SolvencyChart;
