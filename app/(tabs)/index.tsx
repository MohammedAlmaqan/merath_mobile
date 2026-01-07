import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useInheritanceCalculator } from '@/hooks/useInheritanceCalculator';
import { FIQH_DATABASE } from '@/lib/inheritance-calculator';

const MADHABS = [
  { id: 'shafii', name: 'الشافعي', color: '#059669' },
  { id: 'hanafi', name: 'الحنفي', color: '#dc2626' },
  { id: 'maliki', name: 'المالكي', color: '#7c3aed' },
  { id: 'hanbali', name: 'الحنبلي', color: '#0284c7' },
];

const HEIRS = [
  { key: 'husband', label: 'الزوج' },
  { key: 'wife', label: 'الزوجة' },
  { key: 'father', label: 'الأب' },
  { key: 'mother', label: 'الأم' },
  { key: 'grandfather', label: 'الجد' },
  { key: 'grandmother', label: 'الجدة' },
  { key: 'son', label: 'الابن' },
  { key: 'daughter', label: 'البنت' },
  { key: 'grandson', label: 'ابن الابن' },
  { key: 'granddaughter', label: 'بنت الابن' },
  { key: 'full_brother', label: 'الأخ الشقيق' },
  { key: 'full_sister', label: 'الأخت الشقيقة' },
  { key: 'paternal_brother', label: 'الأخ لأب' },
  { key: 'paternal_sister', label: 'الأخت لأب' },
  { key: 'maternal_brother', label: 'الأخ لأم' },
  { key: 'maternal_sister', label: 'الأخت لأم' },
];

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const calculator = useInheritanceCalculator();
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    calculator.calculate();
    if (!calculator.state.error) {
      setShowResults(true);
    } else {
      Alert.alert('خطأ', calculator.state.error);
    }
  };

  const handleReset = () => {
    calculator.reset();
    setShowResults(false);
  };

  const madhhabInfo = calculator.getMadhhabInfo();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!showResults ? (
          <>
            {/* Header */}
            <ThemedText type="title" style={styles.title}>🧮 حاسبة المواريث</ThemedText>
            <ThemedText style={styles.subtitle}>احسب توزيع الميراث وفقاً للمذاهب الإسلامية</ThemedText>

            {/* Madhab Selection */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>اختر المذهب</ThemedText>
              <View style={styles.madhahGrid}>
                {MADHABS.map((madhab) => (
                  <Pressable
                    key={madhab.id}
                    onPress={() => calculator.setMadhab(madhab.id)}
                    style={[
                      styles.madhahButton,
                      { backgroundColor: madhab.color },
                      calculator.state.madhab === madhab.id && styles.madhahButtonActive,
                    ]}
                  >
                    <ThemedText style={styles.madhahButtonText}>{madhab.name}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Estate Data */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>بيانات التركة</ThemedText>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>إجمالي التركة (ريال)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="أدخل المبلغ"
                  placeholderTextColor={colors.text + '80'}
                  keyboardType="decimal-pad"
                  value={calculator.state.estate.total.toString()}
                  onChangeText={(text) => calculator.setEstateField('total', parseFloat(text) || 0)}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>تكاليف الدفن (ريال)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="اختياري"
                  placeholderTextColor={colors.text + '80'}
                  keyboardType="decimal-pad"
                  value={calculator.state.estate.funeral.toString()}
                  onChangeText={(text) => calculator.setEstateField('funeral', parseFloat(text) || 0)}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>الديون (ريال)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="اختياري"
                  placeholderTextColor={colors.text + '80'}
                  keyboardType="decimal-pad"
                  value={calculator.state.estate.debts.toString()}
                  onChangeText={(text) => calculator.setEstateField('debts', parseFloat(text) || 0)}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>الوصية (ريال)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="اختياري"
                  placeholderTextColor={colors.text + '80'}
                  keyboardType="decimal-pad"
                  value={calculator.state.estate.will.toString()}
                  onChangeText={(text) => calculator.setEstateField('will', parseFloat(text) || 0)}
                />
              </View>
            </View>

            {/* Heirs Selection */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>الورثة</ThemedText>
              <View style={styles.heirsGrid}>
                {HEIRS.map((heir) => (
                  <View key={heir.key} style={styles.heirItem}>
                    <ThemedText style={styles.heirLabel}>{heir.label}</ThemedText>
                    <View style={styles.heirInputGroup}>
                      <Pressable
                        onPress={() => {
                          const current = calculator.state.heirs[heir.key as keyof typeof calculator.state.heirs] || 0;
                          if (current > 0) {
                            calculator.setHeirCount(heir.key as any, current - 1);
                          }
                        }}
                        style={styles.heirButton}
                      >
                        <ThemedText style={styles.heirButtonText}>−</ThemedText>
                      </Pressable>
                      <TextInput
                        style={[styles.heirInput, { color: colors.text }]}
                        placeholder="0"
                        placeholderTextColor={colors.text + '80'}
                        keyboardType="number-pad"
                        value={(calculator.state.heirs[heir.key as keyof typeof calculator.state.heirs] || 0).toString()}
                        onChangeText={(text) => calculator.setHeirCount(heir.key as any, parseInt(text) || 0)}
                      />
                      <Pressable
                        onPress={() => {
                          const current = calculator.state.heirs[heir.key as keyof typeof calculator.state.heirs] || 0;
                          calculator.setHeirCount(heir.key as any, current + 1);
                        }}
                        style={styles.heirButton}
                      >
                        <ThemedText style={styles.heirButtonText}>+</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                onPress={handleCalculate}
                disabled={calculator.state.loading}
                style={[styles.button, { backgroundColor: colors.tint }]}
              >
                <ThemedText style={styles.buttonText}>
                  {calculator.state.loading ? 'جاري الحساب...' : 'احسب'}
                </ThemedText>
              </Pressable>
            </View>

            {calculator.state.error && (
              <View style={styles.errorBox}>
                <ThemedText style={styles.errorText}>{calculator.state.error}</ThemedText>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Results */}
            {calculator.state.result && (
              <>
                <ThemedText type="title" style={styles.title}>النتائج</ThemedText>
                <ThemedText style={styles.subtitle}>المذهب: {madhhabInfo?.name}</ThemedText>

                {/* Summary */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>التركة الصافية:</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.summaryValue}>
                      {calculator.state.result.netEstate?.toLocaleString()} ريال
                    </ThemedText>
                  </View>
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>أصل المسألة:</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.summaryValue}>
                      {calculator.state.result.asl}
                    </ThemedText>
                  </View>
                  {calculator.state.result.awlApplied && (
                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryLabel}>العول:</ThemedText>
                      <ThemedText type="defaultSemiBold" style={[styles.summaryValue, { color: '#f59222' }]}>
                        مطبق
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* Results Table */}
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>الوارث</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>العدد</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>النصيب</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>النسبة</ThemedText>
                    <ThemedText style={[styles.tableCell, styles.tableHeaderText]}>المبلغ</ThemedText>
                  </View>
                  {calculator.state.result?.shares?.map((share, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <ThemedText style={styles.tableCell}>{share.name}</ThemedText>
                      <ThemedText style={styles.tableCell}>{share.count}</ThemedText>
                      <ThemedText style={styles.tableCell}>{share.fraction.toArabic()}</ThemedText>
                      <ThemedText style={styles.tableCell}>
                        {((share.fraction.toDecimal() * 100) / (calculator.state.result?.finalBase || 1)).toFixed(1)}%
                      </ThemedText>
                      <ThemedText style={styles.tableCell}>
                        {share.amount?.toLocaleString()} ريال
                      </ThemedText>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <Pressable
                    onPress={handleReset}
                    style={[styles.button, { backgroundColor: colors.tint }]}
                  >
                    <ThemedText style={styles.buttonText}>جديد</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.button, { backgroundColor: '#10b981' }]}
                  >
                    <ThemedText style={styles.buttonText}>طباعة</ThemedText>
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, marginBottom: 8 },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, marginBottom: 12 },
  madhahGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  madhahButton: { flex: 1, minWidth: '48%', paddingVertical: 12, borderRadius: 8, alignItems: 'center', opacity: 0.6 },
  madhahButtonActive: { opacity: 1, borderWidth: 2, borderColor: '#fff' },
  madhahButtonText: { color: '#fff', fontWeight: '600' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, marginBottom: 6, opacity: 0.8 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  heirsGrid: { gap: 12 },
  heirItem: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 8 },
  heirLabel: { fontSize: 13, marginBottom: 8 },
  heirInputGroup: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  heirButton: { width: 36, height: 36, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  heirButtonText: { fontSize: 18, fontWeight: 'bold' },
  heirInput: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, textAlign: 'center' },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  errorBox: { marginTop: 12, padding: 12, backgroundColor: '#ef444420', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 13 },
  summaryBox: { padding: 12, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 8, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, opacity: 0.7 },
  summaryValue: { fontSize: 14 },
  tableContainer: { marginBottom: 16, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  tableHeader: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', paddingVertical: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  tableCell: { flex: 1, fontSize: 12, paddingHorizontal: 8, textAlign: 'center' },
  tableHeaderText: { fontWeight: '600', fontSize: 11 },
});
