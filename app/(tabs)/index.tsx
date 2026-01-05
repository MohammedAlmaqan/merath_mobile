import { ScrollView, View, StyleSheet, Pressable, TextInput, FlatList, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateInheritance, FIQH_DATABASE, type EstateData, type HeirsData, type CalculationResult } from '@/lib/inheritance-calculator';

const MADHABS = ['shafii', 'hanafi', 'maliki', 'hanbali'] as const;
type MadhabhKey = typeof MADHABS[number];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // حالة المذهب
  const [selectedMadhab, setSelectedMadhab] = useState<MadhabhKey>('shafii');

  // حالة بيانات التركة
  const [estateData, setEstateData] = useState<EstateData>({
    total: 100000,
    funeral: 0,
    debts: 0,
    will: 0,
  });

  // حالة الورثة
  const [heirsData, setHeirsData] = useState<HeirsData>({
    husband: 0,
    wife: 0,
    father: 0,
    mother: 0,
    grandfather: 0,
    grandmother: 0,
    son: 0,
    daughter: 0,
    grandson: 0,
    granddaughter: 0,
    full_brother: 0,
    full_sister: 0,
    paternal_brother: 0,
    paternal_sister: 0,
    maternal_brother: 0,
    maternal_sister: 0,
  });

  // حالة النتائج
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // دالة الحساب
  const handleCalculate = useCallback(() => {
    const result = calculateInheritance(selectedMadhab, estateData, heirsData);
    setResults(result);
    setShowResults(true);
  }, [selectedMadhab, estateData, heirsData]);

  // دالة إعادة التعيين
  const handleReset = useCallback(() => {
    setEstateData({
      total: 100000,
      funeral: 0,
      debts: 0,
      will: 0,
    });
    setHeirsData({
      husband: 0,
      wife: 0,
      father: 0,
      mother: 0,
      grandfather: 0,
      grandmother: 0,
      son: 0,
      daughter: 0,
      grandson: 0,
      granddaughter: 0,
      full_brother: 0,
      full_sister: 0,
      paternal_brother: 0,
      paternal_sister: 0,
      maternal_brother: 0,
      maternal_sister: 0,
    });
    setShowResults(false);
    setResults(null);
  }, []);

  // دالة تحديث بيانات التركة
  const updateEstate = (key: keyof EstateData, value: string) => {
    setEstateData(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  };

  // دالة تحديث بيانات الورثة
  const updateHeir = (key: keyof HeirsData, value: string) => {
    setHeirsData(prev => ({
      ...prev,
      [key]: parseInt(value) || 0,
    }));
  };

  const madhab = FIQH_DATABASE.madhabs[selectedMadhab];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* رأس الصفحة */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>حاسبة المواريث</ThemedText>
          <ThemedText style={styles.subtitle}>المذهب: {madhab.name}</ThemedText>
        </View>

        {/* اختيار المذهب */}
        <View style={styles.madhahbSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>اختر المذهب</ThemedText>
          <View style={styles.madhahbGrid}>
            {MADHABS.map(madhab_key => {
              const madhab_config = FIQH_DATABASE.madhabs[madhab_key];
              return (
                <Pressable
                  key={madhab_key}
                  onPress={() => setSelectedMadhab(madhab_key)}
                  style={[
                    styles.madhahbButton,
                    { backgroundColor: madhab_config.color },
                    selectedMadhab === madhab_key && styles.madhahbButtonSelected,
                  ]}
                >
                  <ThemedText style={styles.madhahbButtonText}>{madhab_config.name}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {!showResults ? (
          <>
            {/* بيانات التركة */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>بيانات التركة</ThemedText>
              
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>إجمالي التركة (ريال)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="مثال: 100000"
                  placeholderTextColor={colors.icon}
                  keyboardType="decimal-pad"
                  value={estateData.total.toString()}
                  onChangeText={(value) => updateEstate('total', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>تكاليف الدفن (ريال)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.icon}
                  keyboardType="decimal-pad"
                  value={estateData.funeral.toString()}
                  onChangeText={(value) => updateEstate('funeral', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>الديون (ريال)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.icon}
                  keyboardType="decimal-pad"
                  value={estateData.debts.toString()}
                  onChangeText={(value) => updateEstate('debts', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>الوصية (ريال)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.icon}
                  keyboardType="decimal-pad"
                  value={estateData.will.toString()}
                  onChangeText={(value) => updateEstate('will', value)}
                />
              </View>
            </View>

            {/* الورثة */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>الورثة</ThemedText>
              
              {Object.entries(FIQH_DATABASE.heirNames).map(([key, name]) => (
                <View key={key} style={styles.inputGroup}>
                  <ThemedText style={styles.label}>{name}</ThemedText>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="0"
                    placeholderTextColor={colors.icon}
                    keyboardType="number-pad"
                    value={heirsData[key as keyof HeirsData]?.toString() || '0'}
                    onChangeText={(value) => updateHeir(key as keyof HeirsData, value)}
                  />
                </View>
              ))}
            </View>

            {/* أزرار الإجراءات */}
            <View style={styles.buttonGroup}>
              <Pressable
                onPress={handleCalculate}
                style={[styles.button, styles.calculateButton]}
              >
                <ThemedText style={styles.buttonText}>حساب</ThemedText>
              </Pressable>

              <Pressable
                onPress={handleReset}
                style={[styles.button, styles.resetButton]}
              >
                <ThemedText style={styles.buttonText}>جديد</ThemedText>
              </Pressable>
            </View>
          </>
        ) : results ? (
          <>
            {/* النتائج */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>نتائج الحساب</ThemedText>

              <View style={styles.resultSummary}>
                <View style={styles.resultItem}>
                  <ThemedText style={styles.resultLabel}>التركة الصافية</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    {results.netEstate.toFixed(2)} ريال
                  </ThemedText>
                </View>

                <View style={styles.resultItem}>
                  <ThemedText style={styles.resultLabel}>أصل المسألة</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    {results.finalBase}
                  </ThemedText>
                </View>
              </View>

              {/* جدول النتائج */}
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <ThemedText style={[styles.tableCell, styles.tableCellHeader]}>الوارث</ThemedText>
                  <ThemedText style={[styles.tableCell, styles.tableCellHeader]}>العدد</ThemedText>
                  <ThemedText style={[styles.tableCell, styles.tableCellHeader]}>النصيب</ThemedText>
                  <ThemedText style={[styles.tableCell, styles.tableCellHeader]}>المبلغ</ThemedText>
                </View>

                {results.shares.map((share, index) => (
                  <View key={index} style={styles.tableRow}>
                    <ThemedText style={styles.tableCell}>{share.name}</ThemedText>
                    <ThemedText style={styles.tableCell}>{share.count}</ThemedText>
                    <ThemedText style={styles.tableCell}>{share.fraction.toArabic()}</ThemedText>
                    <ThemedText style={styles.tableCell}>{share.amount.toFixed(2)}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {/* أزرار الإجراءات */}
            <View style={styles.buttonGroup}>
              <Pressable
                onPress={handleReset}
                style={[styles.button, styles.calculateButton]}
              >
                <ThemedText style={styles.buttonText}>جديد</ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setShowResults(false)}
                style={[styles.button, styles.resetButton]}
              >
                <ThemedText style={styles.buttonText}>تعديل</ThemedText>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  madhahbSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  madhahbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  madhahbButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  madhahbButtonSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  madhahbButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'right',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calculateButton: {
    backgroundColor: '#10b981',
  },
  resetButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resultSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  resultItem: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    color: '#10b981',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 12,
    textAlign: 'center',
  },
  tableCellHeader: {
    fontWeight: '600',
    fontSize: 11,
  },
});
