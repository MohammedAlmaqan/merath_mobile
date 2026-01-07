import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  strokeWidth?: number;
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

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  strokeWidth = 8,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentages and angles
  const chartData = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    return {
      ...item,
      percentage,
      angle,
      color: item.color || COLORS[index % COLORS.length],
    };
  });

  // Create pie slices
  let currentAngle = -90; // Start from top
  const slices = chartData.map((item, index) => {
    const startAngle = currentAngle;
    const endAngle = currentAngle + item.angle;
    currentAngle = endAngle;

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate start and end points
    const x1 = size / 2 + radius * Math.cos(startRad);
    const y1 = size / 2 + radius * Math.sin(startRad);
    const x2 = size / 2 + radius * Math.cos(endRad);
    const y2 = size / 2 + radius * Math.sin(endRad);

    // Determine if we need the large arc flag
    const largeArc = item.angle > 180 ? 1 : 0;

    // Create path
    const path = `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Calculate label position
    const labelAngle = startAngle + item.angle / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelRadius = radius * 0.7;
    const labelX = size / 2 + labelRadius * Math.cos(labelRad);
    const labelY = size / 2 + labelRadius * Math.sin(labelRad);

    return {
      path,
      labelX,
      labelY,
      percentage: item.percentage,
      color: item.color,
      index,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />

        {/* Pie slices */}
        {slices.map((slice, index) => (
          <G key={index}>
            {/* Slice path - using Circle with strokeDasharray for pie effect */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${(chartData[index].percentage / 100) * circumference} ${circumference}`}
              strokeDashoffset={-slices.slice(0, index).reduce((sum, s) => sum + (chartData[slices.indexOf(s)].percentage / 100) * circumference, 0)}
              strokeLinecap="round"
            />
            {/* Percentage label */}
            {chartData[index].percentage > 5 && (
              <SvgText
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#fff"
              >
                {chartData[index].percentage.toFixed(0)}%
              </SvgText>
            )}
          </G>
        ))}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: item.color },
              ]}
            />
            <ThemedText style={styles.legendText}>
              {item.name}: {item.percentage.toFixed(1)}%
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  legend: {
    marginTop: 16,
    width: '100%',
    gap: 8,
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
