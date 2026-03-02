import { useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { getChartColors, getCommonChartConfig, formatValue } from './charts/chartUtils';

/**
 * 經營效率圖表 (AR Efficiency)
 * 應收週轉 - 混合圖 (長條圖 + 折線)
 */

// 自訂 Layer - 在長條圖上方顯示數值
const BarLabelsLayer = ({ bars }) => {
  if (!bars || bars.length === 0) return null;

  try {
    return (
      <g style={{ pointerEvents: 'none' }}>
        {bars.map((bar) => {
          const value = bar.data?.value;
          if (value === null || value === undefined) return null;
          const xPos = bar.x + bar.width / 2;
          const yPos = bar.y - 8;
          return (
            <text
              key={`label-${bar.data?.year || bar.index}`}
              x={xPos}
              y={yPos}
              textAnchor="middle"
              dominantBaseline="auto"
              fill="#3b82f6"
              fontSize={14}
              fontWeight={600}
            >
              {formatValue(value, 1)} 次
            </text>
          );
        })}
      </g>
    );
  } catch (error) {
    console.error('BarLabelsLayer error:', error);
    return null;
  }
};

function AREfficiencyChart({ metrics }) {
  if (!metrics || !metrics.years || metrics.years.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">無資料</div>
      </div>
    );
  }

  const arTurnoverData = useMemo(() => {
    return metrics.years.map((year, index) => ({
      year,
      value: metrics.arTurnover?.[index] ?? null,
    }));
  }, [metrics]);

  const lineData = useMemo(() => [{
    id: '應收週轉',
    data: metrics.years.map((year, index) => ({
      x: year,
      y: metrics.arTurnover?.[index] ?? null,
    })),
  }], [metrics]);

  const colors = useMemo(() => ['#3b82f6'], []);
  const commonConfig = useMemo(() => getCommonChartConfig(), []);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4 className="chart-title">經營效率 (AR Efficiency)</h4>
      </div>
      <ResponsiveBar
        {...commonConfig}
        data={arTurnoverData}
        keys={['value']}
        indexBy="year"
        groupMode="grouped"
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={colors}
        borderRadius={4}
        padding={0.3}
        innerPadding={2}
        gridX={false}
        gridY={false}
        axisLeft={null}
        yFormat=">-.0f"
        axisBottom={{
          ...commonConfig.axisBottom,
          legend: '',
          legendOffset: -30,
        }}
        axisTop={null}
        enableLabel={false}
        margin={{ top: 50, right: 20, bottom: 60, left: 50 }}
        layers={['grid', 'axes', 'bars', 'legends', BarLabelsLayer]}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 45,
            itemsSpacing: 30,
            itemWidth: 90,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            symbolSize: 12,
            symbolShape: 'square',
            data: [{ id: 'value', label: '應收週轉', color: '#3b82f6' }],
          },
        ]}
        theme={{
          ...commonConfig.theme,
          grid: {
            line: {
              stroke: 'transparent',
            },
          },
        }}
        isInteractive={false}
      />
    </div>
  );
}

export default AREfficiencyChart;
