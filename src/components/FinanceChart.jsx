import { useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';

/**
 * FinanceChart - 使用 Nivo 建立混合圖表
 * 底層：營收長條圖
 * 上層：淨利折線圖
 * 底部：淨利率標籤區
 */
function FinanceChart({ labels, revenue, profit, selectedYear, onYearChange }) {
  // 準備長條圖資料（營收）
  const barData = useMemo(() => {
    if (!labels || !revenue) return [];
    return labels.map((year, index) => ({
      year,
      revenue: revenue[index],
    }));
  }, [labels, revenue]);

  // 準備折線圖資料（淨利）- 使用與長條圖相同的年份作為 x
  const lineData = useMemo(() => {
    if (!labels || !profit) return [];
    return [
      {
        id: 'profit',
        data: labels.map((year, index) => ({
          x: String(year), // 確保是字串格式，與長條圖的 indexBy 一致
          y: profit[index],
        })),
      },
    ];
  }, [labels, profit]);

  // 淨利率資料
  const margins = useMemo(() => {
    if (!labels || !revenue || !profit) return [];
    return labels.map((year, i) => ({
      year,
      margin: revenue[i] > 0 ? ((profit[i] / revenue[i]) * 100).toFixed(1) + '%' : '0.0%',
    }));
  }, [labels, revenue, profit]);

  // 計算 Y 軸範圍
  const maxRevenue = useMemo(() => {
    if (!revenue || revenue.length === 0) return 100;
    return Math.max(...revenue);
  }, [revenue]);

  const maxProfit = useMemo(() => {
    if (!profit || profit.length === 0) return 100;
    return Math.max(...profit, 10);
  }, [profit]);

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
        <div style={{ color: '#64748b' }}>營收: <span style={{ color: '#0f172a', fontWeight: '600' }}>{rev.toLocaleString()}</span> 百萬</div>
        <div style={{ color: '#64748b' }}>淨利: <span style={{ color: '#3b82f6', fontWeight: '600' }}>{pro.toLocaleString()}</span> 百萬</div>
        <div style={{ color: '#64748b', marginTop: '4px' }}>淨利率: <span style={{ color: '#10b981', fontWeight: '600' }}>{margin}%</span></div>
      </div>
    );
  };

  const LineTooltip = ({ point }) => {
    const year = point.data.xFormatted || point.data.x;
    const idx = labels.indexOf(year);
    const rev = revenue[idx];
    const pro = point.data.yFormatted || point.data.y;
    const margin = rev > 0 ? ((pro / rev) * 100).toFixed(1) : '0.0';

    return (
      <div
        style={{
          background: 'white',
          padding: '12px 16px',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
          color: '#0f172a',
          fontSize: '13px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
          {year} 年度
        </div>
        <div style={{ color: '#3b82f6', fontWeight: '600' }}>淨利: {Number(pro).toLocaleString()} 百萬</div>
        <div style={{ color: '#64748b', marginTop: '4px' }}>淨利率: <span style={{ color: '#10b981', fontWeight: '600' }}>{margin}%</span></div>
      </div>
    );
  };

  if (!labels || labels.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>暂無資料</div>;
  }

  return (
    <div className="chart-nivo-wrapper">
      {/* 單位標籤 */}
      <div className="chart-unit-label">單位：百萬元</div>

      {/* 圖表疊層容器 */}
      <div className="chart-nivo-container">
        {/* 底層：營收長條圖 */}
        <div className="bar-chart-layer">
          <ResponsiveBar
            data={barData}
            keys={['revenue']}
            indexBy="year"
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            padding={0.25}
            layout="vertical"
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            innerPadding={0}
            borderRadius={6}
            colors={(bar) => {
              const isSelected = bar.data.year === selectedYear;
              return isSelected ? '#3b82f6' : '#e2e8f0';
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
              legend: '營收',
              legendPosition: 'middle',
              legendOffset: -35,
              format: (value) => value.toLocaleString(),
              style: {
                tick: { fill: '#94a3b8', fontSize: '12px' },
                legend: { fill: '#64748b', fontSize: '13px', fontWeight: '600' },
              },
            }}
            axisBottom={{
              tickSize: 0,
              tickPadding: 12,
              tickRotation: 0,
              style: {
                tick: { fill: '#475569', fontSize: '14px', fontWeight: '600' },
              },
            }}
            enableGridY={true}
            gridYValues={5}
            gridYStyle={{
              stroke: '#f1f5f9',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 2]],
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            // 顯示數值標籤
            enableLabel={true}
            labelPosition="top"
            labelStyle={{
              fill: '#64748b',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: "'DM Mono', 'Roboto Mono', monospace",
            }}
            animate={true}
            motionConfig="stiff"
            onClick={(node) => {
              onYearChange(node.data.year);
            }}
            tooltip={BarTooltip}
            theme={{
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

        {/* 上層：淨利折線圖 */}
        <div className="line-chart-layer">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 0,
              max: maxProfit * 4.5,
            }}
            yFormat=" >-.2f"
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={null}
            axisLeft={null}
            enableGridX={false}
            enableGridY={false}
            pointSize={10}
            pointSizeSelected={14}
            pointColor="#ffffff"
            pointBorderWidth={3}
            pointBorderColor="#e67e22"
            enableArea={false}
            useMesh={false}
            enableCrosshair={false}
            colors={['#e67e22']}
            lineWidth={3}
            onClick={(point) => {
              const year = point?.data?.xFormatted || point?.data?.x;
              if (year) {
                onYearChange(String(year));
              }
            }}
            tooltip={LineTooltip}
            animate={true}
            motionConfig="stiff"
            layers={[
              'grid',
              'markers',
              'axes',
              'areas',
              'crosshair',
              'lines',
              'points',
              'slices',
              'mesh',
              'legends',
            ]}
          />
        </div>
      </div>

      {/* 底部淨利率標籤區 */}
      <div className="margin-labels-section">
        <div className="margin-title">淨利率 (Net profit margin)</div>
        <div className="margin-values">
          {margins.map((item) => (
            <div
              key={item.year}
              className={`margin-value ${item.year === selectedYear ? 'margin-value-active' : ''}`}
              onClick={() => onYearChange(item.year)}
            >
              <span className="margin-year">{item.year}</span>
              <span className="margin-percent">{item.margin}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FinanceChart;
