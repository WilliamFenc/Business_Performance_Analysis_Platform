import { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { transformMetricsToNivoData, formatValue } from './charts/chartUtils';

/**
 * 成長動能圖表 (Growth)
 * 顯示營收成長率、稅前淨利成長率的趨勢
 * 營收成長用藍色，稅前淨利成長用橙色
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

function GrowthChart({ metrics }) {
  if (!metrics || !metrics.years || metrics.years.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">無資料</div>
      </div>
    );
  }

  const rawData = useMemo(() => {
    return transformMetricsToNivoData(metrics, ['revenueGrowth', 'profitBeforeTaxGrowth'], metrics.years);
  }, [metrics]);

  // 轉換 id 為中文顯示名稱
  const data = useMemo(() => {
    const idMap = {
      revenueGrowth: '營收成長',
      profitBeforeTaxGrowth: '稅前淨利成長',
    };
    return rawData.map(serie => ({
      ...serie,
      id: idMap[serie.id] || serie.id,
    }));
  }, [rawData]);

  // 固定顏色設定
  const getColor = (line) => {
    const colorMap = {
      '營收成長': '#3b82f6',
      '稅前淨利成長': '#f97316',
    };
    return colorMap[line.id] || '#3b82f6';
  };

  return (
    <div className="chart-container" style={{ height: '320px' }}>
      <div className="chart-header">
        <h4 className="chart-title">成長動能 (Growth)</h4>
      </div>
      <ResponsiveLine
        data={data}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
        }}
        axisLeft={null}
        yFormat=">-.1f"
        curve="linear"
        colors={getColor}
        pointSize={6}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'color' }}
        enableArea={false}
        enableGridX={false}
        enableGridY={false}
        isInteractive={false}
        layers={['grid', 'axes', 'areas', 'lines', 'points', 'slices', 'legends', PointLabelsLayer]}
        margin={{ top: 30, right: 20, bottom: 70, left: 20 }}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
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

export default GrowthChart;
