import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CalculationResult } from '@/lib/inheritance-calculator';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';

interface ResultsDisplayProps {
  result: CalculationResult;
  madhhabName: string;
  onPrint: () => void;
  onReset: () => void;
}

export function ResultsDisplay({ result, madhhabName, onPrint, onReset }: ResultsDisplayProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  if (!result) return null;

  // Prepare chart data
  const chartData = result.shares?.map((share, index) => ({
    name: share.name,
    value: share.amount || 0,
    color: ['#059669', '#dc2626', '#a855f7', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'][index % 8],
  })) || [];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <ThemedText type="title" style={styles.title}>📊 نتائج الحساب</ThemedText>
      <ThemedText style={styles.subtitle}>المذهب: {madhhabName}</ThemedText>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { borderLeftColor: colors.tint }]}>
          <ThemedText style={styles.summaryLabel}>التركة الصافية</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.summaryValue}>
            {result.netEstate?.toLocaleString()} ريال
          </ThemedText>
        </View>

        <View style={[styles.summaryCard, { borderLeftColor: '#10b981' }]}>
          <ThemedText style={styles.summaryLabel}>أصل المسألة</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.summaryValue}>
            {result.asl}
          </ThemedText>
        </View>

        <View style={[styles.summaryCard, { borderLeftColor: '#f59222' }]}>
          <ThemedText style={styles.summaryLabel}>الأساس النهائي</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.summaryValue}>
            {result.finalBase}
          </ThemedText>
        </View>
      </View>

      {/* Chart Toggle */}
      {chartData.length > 0 && (
        <>
          <View style={styles.chartToggle}>
            <Pressable
              onPress={() => setChartType('pie')}
              style={[
                styles.chartToggleButton,
                chartType === 'pie' && { backgroundColor: colors.tint },
              ]}
            >
              <ThemedText
                style={[
                  styles.chartToggleText,
                  chartType === 'pie' && { color: '#fff' },
                ]}
              >
                📊 رسم دائري
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setChartType('bar')}
              style={[
                styles.chartToggleButton,
                chartType === 'bar' && { backgroundColor: colors.tint },
              ]}
            >
              <ThemedText
                style={[
                  styles.chartToggleText,
                  chartType === 'bar' && { color: '#fff' },
                ]}
              >
                📈 رسم بياني
              </ThemedText>
            </Pressable>
          </View>

          {/* Charts */}
          {chartType === 'pie' ? (
            <PieChart data={chartData} />
          ) : (
            <BarChart data={chartData} />
          )}
        </>
      )}

      {/* Special Cases */}
      {(result.awlApplied || result.raddApplied || result.bloodRelativesApplied) && (
        <View style={styles.specialCasesBox}>
          <ThemedText type="defaultSemiBold" style={styles.specialCasesTitle}>
            الحالات الخاصة المطبقة
          </ThemedText>
          {result.awlApplied && (
            <View style={styles.specialCaseItem}>
              <ThemedText style={styles.specialCaseLabel}>✓ العول</ThemedText>
              <ThemedText style={styles.specialCaseDesc}>تم تطبيق العول على المسألة</ThemedText>
            </View>
          )}
          {result.raddApplied && (
            <View style={styles.specialCaseItem}>
              <ThemedText style={styles.specialCaseLabel}>✓ الرد</ThemedText>
              <ThemedText style={styles.specialCaseDesc}>تم تطبيق الرد على الورثة</ThemedText>
            </View>
          )}
          {result.bloodRelativesApplied && (
            <View style={styles.specialCaseItem}>
              <ThemedText style={styles.specialCaseLabel}>✓ ذوو الأرحام</ThemedText>
              <ThemedText style={styles.specialCaseDesc}>تم تطبيق قواعد ذوي الأرحام</ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Results Table */}
      <View style={styles.tableSection}>
        <ThemedText type="defaultSemiBold" style={styles.tableSectionTitle}>
          توزيع الميراث
        </ThemedText>
        <View style={styles.tableContainer}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <ThemedText style={[styles.tableHeaderCell, { flex: 2 }]}>الوارث</ThemedText>
            <ThemedText style={[styles.tableHeaderCell, { flex: 1 }]}>العدد</ThemedText>
            <ThemedText style={[styles.tableHeaderCell, { flex: 1.5 }]}>النصيب</ThemedText>
            <ThemedText style={[styles.tableHeaderCell, { flex: 1 }]}>النسبة</ThemedText>
            <ThemedText style={[styles.tableHeaderCell, { flex: 1.5 }]}>المبلغ</ThemedText>
          </View>

          {/* Rows */}
          {result.shares?.map((share, idx) => {
            const percentage = ((share.fraction.toDecimal() * 100) / (result.finalBase || 1)).toFixed(1);
            return (
              <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlternate]}>
                <ThemedText style={[styles.tableCell, { flex: 2 }]}>{share.name}</ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1 }]}>{share.count}</ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1.5 }]}>{share.fraction.toArabic()}</ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1 }]}>{percentage}%</ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1.5 }, styles.amount]}>
                  {share.amount?.toLocaleString()}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>

      {/* Blocked Heirs */}
      {result.blockedHeirs && result.blockedHeirs.length > 0 && (
        <View style={styles.blockedHeirsBox}>
          <ThemedText type="defaultSemiBold" style={styles.blockedHeirsTitle}>
            الورثة المحجوبون
          </ThemedText>
          {result.blockedHeirs.map((blocked, idx) => (
            <View key={idx} style={styles.blockedHeirItem}>
              <ThemedText style={styles.blockedHeirName}>{blocked.heir}</ThemedText>
              <ThemedText style={styles.blockedHeirReason}>
                محجوب بـ: {blocked.by} - {blocked.reason}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Calculation Steps */}
      {result.steps && result.steps.length > 0 && (
        <View style={styles.stepsBox}>
          <ThemedText type="defaultSemiBold" style={styles.stepsTitle}>
            خطوات الحساب
          </ThemedText>
          {result.steps.map((step, idx) => (
            <View key={idx} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>{idx + 1}</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="defaultSemiBold" style={styles.stepTitle}>
                  {step.title}
                </ThemedText>
                <ThemedText style={styles.stepDescription}>
                  {step.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          onPress={onReset}
          style={[styles.button, { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' }]}
        >
          <ThemedText style={styles.buttonTextSecondary}>جديد</ThemedText>
        </Pressable>
        <Pressable
          onPress={onPrint}
          style={[styles.button, { backgroundColor: '#10b981' }]}
        >
          <ThemedText style={styles.buttonText}>طباعة</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, marginBottom: 8 },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 20 },
  summaryGrid: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  summaryCard: { flex: 1, minWidth: '30%', padding: 12, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.02)', borderLeftWidth: 4 },
  summaryLabel: { fontSize: 12, opacity: 0.7, marginBottom: 6 },
  summaryValue: { fontSize: 16 },
  chartToggle: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  chartToggleButton: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  chartToggleText: { fontSize: 13, fontWeight: '600' },
  specialCasesBox: { padding: 12, backgroundColor: '#f0fdf420', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#22c55e', marginBottom: 20 },
  specialCasesTitle: { fontSize: 14, marginBottom: 12, color: '#22c55e' },
  specialCaseItem: { marginBottom: 8 },
  specialCaseLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  specialCaseDesc: { fontSize: 12, opacity: 0.8 },
  tableSection: { marginBottom: 20 },
  tableSectionTitle: { fontSize: 14, marginBottom: 12 },
  tableContainer: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  tableHeader: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', paddingVertical: 8, paddingHorizontal: 8 },
  tableHeaderCell: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  tableRowAlternate: { backgroundColor: 'rgba(0,0,0,0.02)' },
  tableCell: { fontSize: 12, textAlign: 'center' },
  amount: { fontWeight: '600' },
  blockedHeirsBox: { padding: 12, backgroundColor: '#fef2f220', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#f97316', marginBottom: 20 },
  blockedHeirsTitle: { fontSize: 14, marginBottom: 12, color: '#f97316' },
  blockedHeirItem: { marginBottom: 8 },
  blockedHeirName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  blockedHeirReason: { fontSize: 12, opacity: 0.8 },
  stepsBox: { padding: 12, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 8, marginBottom: 20 },
  stepsTitle: { fontSize: 14, marginBottom: 12 },
  stepItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 13, marginBottom: 2 },
  stepDescription: { fontSize: 12, opacity: 0.8, lineHeight: 18 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  buttonTextSecondary: { fontWeight: '600', fontSize: 16 },
});
