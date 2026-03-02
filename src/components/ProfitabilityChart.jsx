import { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { transformMetricsToNivoData, formatValue } from './charts/chartUtils';

/**
 * 獲利能力圖表 (Profitability)
 * 顯示淨利率、毛利率的趨勢
 */
function ProfitabilityChart({ metrics }) {
  if (!metrics || !metrics.years || metrics.years.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">無資料</div>
      </div>
    );
  }

  // 轉換資料為 Nivo 格式（只保留毛利率和淨利率）
  const rawData = useMemo(() => {
    return transformMetricsToNivoData(metrics, ['netProfitMargin', 'grossMargin'], metrics.years);
  }, [metrics]);

  // 自訂圖例名稱
  const data = useMemo(() => {
    const nameMap = {
      netProfitMargin: '淨利率%',
      grossMargin: '毛利率%',
    };
    return rawData.map(serie => ({
      ...serie,
      id: nameMap[serie.id] || serie.id,
      // 保存原始 id 用於 key
      originalId: serie.id,
    }));
  }, [rawData]);

  // 顏色配置 - 毛利率橙色，淨利率綠色
  const colors = ['#f59e0b', '#10b981'];

  // 建立端點標籤 layer
  const PointLabelsLayer = ({ points }) => {
    return (
      <g>
        {points.map((point, idx) => {
          if (point.data.y === null || point.data.y === undefined) return null;
          // 使用 idx 作為 key，確保唯一
          return (
            <text
              key={`point-label-${idx}`}
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fill="#333"
              fontSize={12}
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              {formatValue(point.data.y, 1)}%
            </text>
          );
        })}
      </g>
    );
  };

  // 自訂主題 - 拿掉格線
  const customTheme = {
    axis: {
      ticks: {
        text: {
          fill: '#64748b',
          fontSize: 11,
        },
      },
      legend: {
        text: {
          fill: '#64748b',
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
    grid: {
      line: {
        stroke: 'transparent',
        strokeWidth: 0,
      },
    },
    tooltip: {
      container: {
        background: '#ffffff',
        color: '#1e293b',
        fontSize: 13,
        borderRadius: '4px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: '320px' }}>
      <div className="chart-header">
        <h4 className="chart-title">獲利能力 (Profitability)</h4>
      </div>
      <ResponsiveLine
        data={data}
        margin={{ top: 30, right: 20, bottom: 60, left: 20 }}
        yScale={{
          type: 'linear',
          min: 0,
          max: 'auto',
        }}
        xScale={{
          type: 'point',
        }}
        // 拿掉 Y 軸
        axisLeft={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          truncateTickAt: 0,
        }}
        // 拿掉格線
        enableGridX={false}
        enableGridY={false}
        yFormat=">-.2f"
        curve="monotoneX"
        colors={colors}
        pointSize={8}
        pointBorderWidth={2}
        pointBorderColor="#fff"
        enableArea={true}
        areaBaselineValue={0}
        areaOpacity={0.15}
        useMesh={false}
        enableCrosshair={false}
        theme={customTheme}
        // 添加端點標籤 layer（不使用 grid 層來拿掉格線）
        layers={[
          'axes',
          'areas',
          'lines',
          'points',
          PointLabelsLayer,
          'slices',
          'legends',
        ]}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: 'center',
            translateX: 0,
            translateY: 40,
            itemsSpacing: 20,
            itemWidth: 60,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            symbolSize: 10,
            symbolShape: 'square',
          },
        ]}
      />
    </div>
  );
}

export default ProfitabilityChart;
