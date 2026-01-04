import { ScrollView, View, StyleSheet, Pressable, TextInput, FlatList, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateInheritance, FIQH_DATABASE, type EstateData, type HeirsData, type CalculationResult } from '@/lib/inheritance-calculator';
import Collapsible from '@/components/ui/collapsible';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReportHTML, generateCSV, saveFile, saveReportMetadata } from '@/lib/report';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    steps: false,
    validation: false,
    comparison: false,
  });
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<Record<MadhabhKey, CalculationResult | null>>({} as any);

  // دالة الحساب
  const handleCalculate = useCallback(() => {
    const result = calculateInheritance(selectedMadhab, estateData, heirsData);
    setResults(result);
    setShowResults(true);
    setExpandedSections({ steps: false, validation: false, comparison: false });

    // حساب النتائج لجميع المذاهب للمقارنة
    const allMadhabs: Record<MadhabhKey, CalculationResult | null> = {} as any;
    MADHABS.forEach(madhab => {
      allMadhabs[madhab] = calculateInheritance(madhab, estateData, heirsData);
    });
    setComparisonResults(allMadhabs);
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

  // دالة تبديل قسم محدد
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // دالة الحصول على رمز الحالة الخاصة
  const getSpecialCaseIcon = (result: CalculationResult) => {
    if (result.specialCases?.includes('umariyyah')) return '⚠️ عمرية';
    if (result.specialCases?.includes('awl')) return '📊 عول';
    return null;
  };

  // دالة الحصول على لون الثقة
  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return '#10b981';
    if (confidence >= 0.9) return '#10b981'; // أخضر - عالي
    if (confidence >= 0.7) return '#f59e0b'; // برتقالي - متوسط
    return '#ef4444'; // أحمر - منخفض
  };

  // --- Export helpers (PDF / CSV) ---
  const generateReportHTML = (result: CalculationResult, madhabKey: MadhabhKey) => {
    const madhabConfig = FIQH_DATABASE.madhabs[madhabKey];
    const rows = result.shares.map(s => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd">${s.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${s.count}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${s.fraction.toString()}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${s.amount.toFixed(2)}</td>
      </tr>`).join('\n');

    return `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>body{font-family:Arial,Helvetica,sans-serif;direction:rtl;text-align:right} table{border-collapse:collapse;width:100%}</style>
      </head>
      <body>
        <h2>نتيجة حساب المواريث - ${madhabConfig.name}</h2>
        <p><strong>التركة الصافية:</strong> ${result.netEstate.toFixed(2)} ريال</p>
        <p><strong>أصل المسألة:</strong> ${result.finalBase}</p>
        <p><strong>مستوى الثقة:</strong> ${result.confidence ? Math.round(result.confidence * 100) + '%' : 'N/A'}</p>
        <h3>تفصيل الأنصبة</h3>
        <table>
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd">الوارث</th>
              <th style="padding:8px;border:1px solid #ddd">العدد</th>
              <th style="padding:8px;border:1px solid #ddd">النصيب</th>
              <th style="padding:8px;border:1px solid #ddd">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <hr/>
        <p>مولّد بواسطة تطبيق مرث (Merath) - الجوال</p>
      </body>
      </html>
    `;
  };

  const handleExportPDF = useCallback(async (madhabKey?: MadhabhKey) => {
    try {
      if (!results) return Alert.alert('لا توجد نتيجة للتصدير');
      const key = madhabKey ?? selectedMadhab;
      const html = generateReportHTML(results, key);
      const { uri } = await Print.printToFileAsync({ html });
      // share the generated PDF
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    } catch (err: any) {
      console.error('PDF export error', err);
      Alert.alert('خطأ', 'فشل إنشاء ملف PDF');
    }
  }, [results, selectedMadhab]);

  const handleExportCSV = useCallback(async (madhabKey?: MadhabhKey) => {
    try {
      if (!results) return Alert.alert('لا توجد نتيجة للتصدير');
      const csv = generateCSV(results);
      const path = await saveFile(csv, 'csv');
      await Sharing.shareAsync(path, { mimeType: 'text/csv' });
    } catch (err: any) {
      console.error('CSV export error', err);
      Alert.alert('خطأ', 'فشل إنشاء ملف CSV');
    }
  }, [results, selectedMadhab]);

  const handleSaveReport = useCallback(async (type: 'pdf' | 'csv') => {
    try {
      if (!results) return Alert.alert('لا توجد نتيجة للحفظ');
      if (type === 'pdf') {
        const html = generateReportHTML(results, selectedMadhab);
        const { uri } = await Print.printToFileAsync({ html });
        // copy to app storage for persistence
        const dest = uri; // Print returns file:// uri inside cache; save metadata only
        const meta = await saveReportMetadata({ path: dest, name: `تقرير_${selectedMadhab}`, madhab: selectedMadhab, type: 'pdf' });
        Alert.alert('تم الحفظ', 'تم حفظ التقرير مؤقتاً في الجهاز');
      } else {
        const csv = generateCSV(results);
        const path = await saveFile(csv, 'csv');
        const meta = await saveReportMetadata({ path, name: `تقرير_${selectedMadhab}`, madhab: selectedMadhab, type: 'csv' });
        Alert.alert('تم الحفظ', 'تم حفظ ملف CSV');
      }
    } catch (err: any) {
      console.error('save report error', err);
      Alert.alert('خطأ', 'فشل حفظ التقرير');
    }
  }, [results, selectedMadhab]);

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
            {/* رسالة الحالة الخاصة */}
            {getSpecialCaseIcon(results) && (
              <View style={[styles.section, styles.specialCaseBox]}>
                <ThemedText type="defaultSemiBold" style={styles.specialCaseText}>
                  {getSpecialCaseIcon(results)}
                </ThemedText>
                {results.specialCases?.includes('umariyyah') && (
                  <ThemedText style={styles.specialCaseDetail}>
                    حالة عمرية: قال عمر بن الخطاب - للزوج النصف والباقي لولي المتوفاة من عصبة
                  </ThemedText>
                )}
                {results.specialCases?.includes('awl') && (
                  <ThemedText style={styles.specialCaseDetail}>
                    عول: مجموع الفروض أكثر من الواحد، فتعول المسألة وتقل أنصبة الورثة
                  </ThemedText>
                )}
              </View>
            )}

            {/* تحذيرات التحقق */}
            {results.warnings && results.warnings.length > 0 && (
              <View style={[styles.section, styles.warningBox]}>
                <Pressable onPress={() => toggleSection('validation')}>
                  <View style={styles.collapsibleHeader}>
                    <ThemedText type="defaultSemiBold">⚠️ تنبيهات ({results.warnings.length})</ThemedText>
                    <ThemedText>{expandedSections.validation ? '−' : '+'}</ThemedText>
                  </View>
                </Pressable>
                {expandedSections.validation && (
                  <View style={styles.collapsibleContent}>
                    {results.warnings.map((warning, idx) => (
                      <ThemedText key={idx} style={styles.warningText}>
                        • {warning}
                      </ThemedText>
                    ))}
                  </View>
                )}
              </View>
            )}

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

                {results.confidence !== undefined && (
                  <View style={styles.resultItem}>
                    <ThemedText style={styles.resultLabel}>مستوى الثقة</ThemedText>
                    <ThemedText 
                      type="defaultSemiBold" 
                      style={[
                        styles.resultValue,
                        { color: getConfidenceColor(results.confidence) }
                      ]}
                    >
                      {Math.round(results.confidence * 100)}%
                    </ThemedText>
                  </View>
                )}
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

            {/* خطوات الحساب */}
            {results.steps && results.steps.length > 0 && (
              <View style={styles.section}>
                <Pressable onPress={() => toggleSection('steps')}>
                  <View style={styles.collapsibleHeader}>
                    <ThemedText type="defaultSemiBold">📋 خطوات الحساب ({results.steps.length})</ThemedText>
                    <ThemedText>{expandedSections.steps ? '−' : '+'}</ThemedText>
                  </View>
                </Pressable>
                {expandedSections.steps && (
                  <View style={styles.collapsibleContent}>
                    {results.steps.map((step, idx) => (
                      <View key={idx} style={styles.stepItem}>
                        <ThemedText type="defaultSemiBold" style={styles.stepNumber}>
                          خطوة {idx + 1}: {step.step}
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                          {step.description}
                        </ThemedText>
                        {step.result && (
                          <ThemedText style={styles.stepResult}>
                            النتيجة: {step.result}
                          </ThemedText>
                        )}
                        {step.notes && (
                          <ThemedText style={styles.stepNotes}>
                            ملاحظة: {step.notes}
                          </ThemedText>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* مقارنة المذاهب */}
            {Object.keys(comparisonResults).length > 1 && (
              <View style={styles.section}>
                <Pressable onPress={() => toggleSection('comparison')}>
                  <View style={styles.collapsibleHeader}>
                    <ThemedText type="defaultSemiBold">🔄 مقارنة المذاهب</ThemedText>
                    <ThemedText>{expandedSections.comparison ? '−' : '+'}</ThemedText>
                  </View>
                </Pressable>
                {expandedSections.comparison && (
                  <View style={styles.collapsibleContent}>
                    {MADHABS.map(madhab_key => {
                      const madhab_result = comparisonResults[madhab_key];
                      const madhab_config = FIQH_DATABASE.madhabs[madhab_key];
                      
                      if (!madhab_result) return null;

                      return (
                        <View key={madhab_key} style={[
                          styles.comparisonItem,
                          { borderLeftColor: madhab_config.color, borderLeftWidth: 4 }
                        ]}>
                          <ThemedText type="defaultSemiBold" style={styles.comparisonMadhab}>
                            {madhab_config.name}
                          </ThemedText>
                          <View style={styles.comparisonRow}>
                            <ThemedText style={styles.comparisonLabel}>أصل المسألة:</ThemedText>
                            <ThemedText type="defaultSemiBold">{madhab_result.finalBase}</ThemedText>
                          </View>
                          <View style={styles.comparisonRow}>
                            <ThemedText style={styles.comparisonLabel}>صيغة الحساب:</ThemedText>
                            <ThemedText type="defaultSemiBold">{madhab_config.name}</ThemedText>
                          </View>
                          <View style={styles.comparisonShares}>
                            {madhab_result.shares.slice(0, 3).map((share, idx) => (
                              <View key={idx} style={styles.comparisionShareItem}>
                                <ThemedText style={styles.comparisonShareName}>{share.name}</ThemedText>
                                <ThemedText style={styles.comparisonShareAmount}>{share.amount.toFixed(0)}</ThemedText>
                              </View>
                            ))}
                            {madhab_result.shares.length > 3 && (
                              <ThemedText style={styles.comparisonMore}>+{madhab_result.shares.length - 3}</ThemedText>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

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
            {/* Export Buttons */}
            <View style={[styles.buttonGroup, { marginTop: 12 }]}>
              <Pressable
                onPress={() => handleExportPDF()}
                style={[styles.button, styles.pdfButton]}
              >
                <ThemedText style={styles.buttonText}>تصدير PDF</ThemedText>
              </Pressable>

              <Pressable
                onPress={() => handleExportCSV()}
                style={[styles.button, styles.csvButton]}
              >
                <ThemedText style={styles.buttonText}>تصدير CSV</ThemedText>
              </Pressable>
            </View>
            <View style={[styles.buttonGroup, { marginTop: 8 }]}> 
              <Pressable onPress={() => handleSaveReport('pdf')} style={[styles.button, styles.pdfButton]}>
                <ThemedText style={styles.buttonText}>حفظ PDF</ThemedText>
              </Pressable>
              <Pressable onPress={() => handleSaveReport('csv')} style={[styles.button, styles.csvButton]}>
                <ThemedText style={styles.buttonText}>حفظ CSV</ThemedText>
              </Pressable>
            </View>
            <View style={[styles.buttonGroup, { marginTop: 8 }]}> 
              <Pressable onPress={() => (window as any).router?.push('/history')} style={[styles.button, styles.calculateButton]}>
                <ThemedText style={styles.buttonText}>سجل التقارير</ThemedText>
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
  specialCaseBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    paddingHorizontal: 12,
  },
  specialCaseText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#92400e',
  },
  specialCaseDetail: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  warningText: {
    fontSize: 13,
    color: '#991b1b',
    marginVertical: 4,
    lineHeight: 18,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  collapsibleContent: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  stepItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stepNumber: {
    fontSize: 13,
    color: '#10b981',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  stepResult: {
    fontSize: 12,
    color: '#0891b2',
    fontWeight: '500',
    marginBottom: 2,
  },
  stepNotes: {
    fontSize: 12,
    color: '#7c3aed',
    fontStyle: 'italic',
    marginTop: 4,
  },
  comparisonItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  comparisonMadhab: {
    fontSize: 14,
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 4,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#666',
  },
  comparisonShares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  comparisionShareItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  comparisonShareName: {
    fontSize: 11,
    color: '#666',
  },
  comparisonShareAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
    marginTop: 2,
  },
  comparisonMore: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pdfButton: {
    backgroundColor: '#111827',
  },
  csvButton: {
    backgroundColor: '#2563eb',
  },
  historyButton: {
    backgroundColor: '#0ea5e9',
  },
});
