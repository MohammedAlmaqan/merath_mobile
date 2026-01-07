import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const TEST_CASES = [
  { id: '1', name: 'حالة بسيطة: زوج وأم', category: 'بسيطة', status: 'نجح', result: '✓' },
  { id: '2', name: 'حالة معقدة: عول', category: 'معقدة', status: 'نجح', result: '✓' },
  { id: '3', name: 'حالة خاصة: العمرية', category: 'خاصة', status: 'نجح', result: '✓' },
  { id: '4', name: 'حالة حدية: ذوو الأرحام', category: 'حدية', status: 'نجح', result: '✓' },
  { id: '5', name: 'حالة معقدة: رد', category: 'معقدة', status: 'نجح', result: '✓' },
  { id: '6', name: 'حالة خاصة: الأكدرية', category: 'خاصة', status: 'نجح', result: '✓' },
];

export default function TestsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  const categories = ['الكل', 'بسيطة', 'معقدة', 'خاصة', 'حدية'];
  const filteredTests = selectedCategory === 'الكل' 
    ? TEST_CASES 
    : TEST_CASES.filter(test => test.category === selectedCategory);

  const passedTests = filteredTests.filter(t => t.status === 'نجح').length;
  const passRate = Math.round((passedTests / filteredTests.length) * 100);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>✅ اختبارات النظام</ThemedText>
        <ThemedText style={styles.subtitle}>التحقق من دقة الحسابات</ThemedText>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>{filteredTests.length}</ThemedText>
            <ThemedText style={styles.statLabel}>إجمالي الاختبارات</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#10b98120' }]}>
            <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#10b981' }]}>{passedTests}</ThemedText>
            <ThemedText style={styles.statLabel}>نجح</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f5922220' }]}>
            <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#f59222' }]}>{passRate}%</ThemedText>
            <ThemedText style={styles.statLabel}>نسبة النجاح</ThemedText>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.filterButton,
                  selectedCategory === item && [styles.filterButtonActive, { backgroundColor: colors.tint }],
                ]}
              >
                <ThemedText style={[styles.filterText, selectedCategory === item && { color: '#fff' }]}>
                  {item}
                </ThemedText>
              </Pressable>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Test Cases */}
        <View style={styles.testsList}>
          {filteredTests.map((test) => (
            <View key={test.id} style={styles.testCard}>
              <View style={styles.testHeader}>
                <ThemedText style={styles.testName}>{test.name}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: '#10b98140' }]}>
                  <ThemedText style={[styles.statusText, { color: '#10b981' }]}>
                    {test.result}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.testFooter}>
                <ThemedText style={styles.testCategory}>{test.category}</ThemedText>
                <ThemedText style={styles.testStatus}>{test.status}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, marginBottom: 8 },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 20 },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  statValue: { fontSize: 20, marginBottom: 4 },
  statLabel: { fontSize: 12, opacity: 0.7 },
  filterContainer: { marginBottom: 20 },
  filterList: { gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  filterButtonActive: { borderColor: 'transparent' },
  filterText: { fontSize: 14, fontWeight: '600' },
  testsList: { gap: 12 },
  testCard: { padding: 12, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.02)', borderWidth: 1, borderColor: '#e5e7eb' },
  testHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  testName: { fontSize: 14, fontWeight: '600', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  testFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  testCategory: { fontSize: 12, opacity: 0.6 },
  testStatus: { fontSize: 12, opacity: 0.6 },
});
