import { useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { getChartColors, getCommonChartConfig, formatValue, filterOutliers } from './charts/chartUtils';

/**
 * 存貨週轉圖表 (Inventory)
 * 存貨周轉 - 混合圖 (長條圖)
 * 注意: 需處理異常值 (如 31331)
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
          // 加入千分位符號
          const formattedValue = value != null ? Math.round(value).toLocaleString() : '';
          return (
            <text
              key={`label-${bar.data?.year || bar.index}`}
              x={xPos}
              y={yPos}
              textAnchor="middle"
              dominantBaseline="auto"
              fill="#10b981"
              fontSize={14}
              fontWeight={600}
            >
              {formattedValue}
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

function InventoryChart({ metrics }) {
  if (!metrics || !metrics.years || metrics.years.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">無資料</div>
      </div>
    );
  }

  // 處理異常值
  const filteredInventory = useMemo(() => {
    return filterOutliers(metrics.inventoryTurnover, 3);
  }, [metrics.inventoryTurnover]);

  const data = useMemo(() => {
    return metrics.years.map((year, index) => ({
      year,
      value: filteredInventory[index] ?? null,
    }));
  }, [metrics.years, filteredInventory]);

  const colors = useMemo(() => ['#10b981'], []);
  const commonConfig = useMemo(() => getCommonChartConfig(), []);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4 className="chart-title">存貨週轉 (Inventory)</h4>
      </div>
      <ResponsiveBar
        {...commonConfig}
        data={data}
        keys={['value']}
        indexBy="year"
        groupMode="grouped"
        valueScale={{ type: 'linear', min: 0 }}
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
            data: [{ id: 'value', label: '存貨週轉', color: '#10b981' }],
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

export default InventoryChart;
