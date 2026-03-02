import { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { transformMetricsToNivoData, getChartColors, getCommonChartConfig, formatValue } from './charts/chartUtils';

/**
 * 費用率趨勢圖表 (Expense Trend)
 * 顯示推銷費用、管理費用、研發費用佔比的趨勢
 */

// 自訂 Layer - 在折線端點顯示數值
const PointLabelsLayer = ({ points }) => {
  try {
    return (
      <g style={{ pointerEvents: 'none' }}>
        {points.map((point) => {
          const value = point.data?.y;
          if (value === null || value === undefined) return null;
          return (
            <text
              key={point.id}
              x={point.x}
              y={point.y - 8}
              textAnchor="middle"
              fill="#333"
              fontSize={9}
              fontWeight="600"
            >
              {formatValue(value, 1)}%
            </text>
          );
        })}
      </g>
    );
  } catch (error) {
    console.error('PointLabelsLayer error:', error);
    return null;
  }
};
function ExpenseTrendChart({ metrics }) {
  if (!metrics || !metrics.years || metrics.years.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">無資料</div>
      </div>
    );
  }

  const rawData = useMemo(() => {
    return transformMetricsToNivoData(metrics, ['sellingExpenseRatio', 'adminExpenseRatio', 'rdExpenseRatio'], metrics.years);
  }, [metrics]);

  // 轉換 id 為中文顯示名稱
  const data = useMemo(() => {
    const idMap = {
      sellingExpenseRatio: '推銷%',
      adminExpenseRatio: '管理%',
      rdExpenseRatio: '研發%',
    };
    return rawData.map(serie => ({
      ...serie,
      id: idMap[serie.id] || serie.id,
    }));
  }, [rawData]);

  const colors = useMemo(() => getChartColors('expense'), []);
  const commonConfig = useMemo(() => getCommonChartConfig(), []);

  return (
    <div className="chart-container" style={{ height: '320px' }}>
      <div className="chart-header">
        <h4 className="chart-title">費用率趨勢 (Expense Trend)</h4>
      </div>
      <ResponsiveLine
        data={data}
        yScale={{
          type: 'linear',
          min: 0,
          max: 'auto',
        }}
        margin={{ top: 30, right: 20, bottom: 70, left: 20 }}
        axisBottom={commonConfig.axisBottom}
        axisLeft={null}
        yFormat=">-.1f"
        curve="monotoneX"
        colors={colors}
        pointSize={6}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'color' }}
        enableArea={false}
        enableGridX={false}
        enableGridY={false}
        isInteractive={false}
        layers={['grid', 'axes', 'areas', 'lines', 'points', 'slices', 'legends', PointLabelsLayer]}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: true,
            translateX: 0,
            translateY: 48,
            itemsSpacing: 30,
            itemWidth: 90,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            symbolSize: 8,
            symbolShape: 'circle',
          },
        ]}
      />
    </div>
  );
}

export default ExpenseTrendChart;
