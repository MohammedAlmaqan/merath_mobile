import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';

interface BarChartData {
  name: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  width?: number;
}

const COLORS = [
  '#059669', // Green
  '#dc2626', // Red
  '#a855f7', // Purple
  '#0ea5e9', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
];

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  width = Dimensions.get('window').width - 32,
}) => {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText>لا توجد بيانات للعرض</ThemedText>
      </View>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const scale = chartHeight / maxValue;

  // Calculate bar width
  const barWidth = chartWidth / (data.length * 1.5);
  const barSpacing = chartWidth / data.length;

  // Generate bars
  const bars = data.map((item, index) => {
    const barHeight = item.value * scale;
    const x = padding.left + barSpacing * index + (barSpacing - barWidth) / 2;
    const y = padding.top + chartHeight - barHeight;

    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      color: item.color || COLORS[index % COLORS.length],
      value: item.value,
      name: item.name,
      index,
    };
  });

  // Generate y-axis labels
  const yAxisSteps = 5;
  const yAxisLabels = [];
  for (let i = 0; i <= yAxisSteps; i++) {
    const value = (maxValue / yAxisSteps) * i;
    yAxisLabels.push({
      value,
      y: padding.top + chartHeight - (value / maxValue) * chartHeight,
    });
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Y-axis */}
        <Line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* X-axis */}
        <Line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight}
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* Y-axis labels and grid lines */}
        {yAxisLabels.map((label, index) => (
          <View key={`y-${index}`}>
            {/* Grid line */}
            <Line
              x1={padding.left}
              y1={label.y}
              x2={width - padding.right}
              y2={label.y}
              stroke="#f0f0f0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            {/* Label */}
            <SvgText
              x={padding.left - 10}
              y={label.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#999"
            >
              {label.value.toFixed(0)}
            </SvgText>
          </View>
        ))}

        {/* Bars */}
        {bars.map((bar, index) => (
          <View key={`bar-${index}`}>
            <Rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              rx="4"
            />
            {/* Value label on top of bar */}
            <SvgText
              x={bar.x + bar.width / 2}
              y={bar.y - 5}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#333"
            >
              {bar.value.toFixed(0)}
            </SvgText>
          </View>
        ))}

        {/* X-axis labels */}
        {bars.map((bar, index) => (
          <SvgText
            key={`label-${index}`}
            x={bar.x + bar.width / 2}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            fontSize="11"
            fill="#666"
          >
            {data[index].name}
          </SvgText>
        ))}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: item.color || COLORS[index % COLORS.length] },
              ]}
            />
            <ThemedText style={styles.legendText}>
              {item.name}: {item.value.toLocaleString()}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  legend: {
    marginTop: 16,
    width: '100%',
    gap: 8,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    flex: 1,
  },
});
