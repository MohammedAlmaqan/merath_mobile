import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const MADHAB_RULES = {
  shafii: {
    name: 'الشافعي',
    color: '#10b981',
    rules: [
      { rule: 'الرد', description: 'الرد على أصحاب الفروض عدا الزوجين' },
      { rule: 'حجب الجد', description: 'الجد يحجب الإخوة مطلقاً' },
      { rule: 'ذوو الأرحام', description: 'يرثون عند عدم العصبة' },
      { rule: 'العول', description: 'يطبق العول عند زيادة الفروض' },
    ],
  },
  hanafi: {
    name: 'الحنفي',
    color: '#ef4444',
    rules: [
      { rule: 'الرد', description: 'الرد على أصحاب الفروض عدا الزوجين' },
      { rule: 'حجب الجد', description: 'الجد لا يحجب الإخوة في بعض الحالات' },
      { rule: 'ذوو الأرحام', description: 'لا يرثون إلا عند عدم الوارثين' },
      { rule: 'العول', description: 'يطبق العول بشكل مختلف' },
    ],
  },
  maliki: {
    name: 'المالكي',
    color: '#a855f7',
    rules: [
      { rule: 'الرد', description: 'الرد على أصحاب الفروض عدا الزوجين' },
      { rule: 'حجب الجد', description: 'الجد يحجب الإخوة مع استثناءات' },
      { rule: 'ذوو الأرحام', description: 'يرثون بشروط معينة' },
      { rule: 'العول', description: 'يطبق العول في حالات محددة' },
    ],
  },
  hanbali: {
    name: 'الحنبلي',
    color: '#3b82f6',
    rules: [
      { rule: 'الرد', description: 'الرد على أصحاب الفروض عدا الزوجين' },
      { rule: 'حجب الجد', description: 'الجد يحجب الإخوة مطلقاً' },
      { rule: 'ذوو الأرحام', description: 'يرثون عند عدم العصبة' },
      { rule: 'العول', description: 'يطبق العول عند الحاجة' },
    ],
  },
};

export default function CompareScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedRule, setSelectedRule] = useState<string>('الرد');

  const madhabs = Object.entries(MADHAB_RULES).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>📊 مقارنة المذاهب</ThemedText>
        <ThemedText style={styles.subtitle}>عرض الفروقات بين المذاهب الإسلامية الأربعة</ThemedText>
        
        <View style={styles.madhahsGrid}>
          {madhabs.map((madhab) => (
            <View key={madhab.id} style={[styles.madhahCard, { borderLeftColor: madhab.color }]}>
              <View style={[styles.madhahHeader, { backgroundColor: madhab.color }]}>
                <ThemedText style={styles.madhahName}>{madhab.name}</ThemedText>
              </View>
              <View style={styles.madhahRules}>
                {madhab.rules.map((rule, idx) => (
                  <View key={idx} style={styles.ruleItem}>
                    <ThemedText style={styles.ruleName}>{rule.rule}</ThemedText>
                    <ThemedText style={styles.ruleDesc}>{rule.description}</ThemedText>
                  </View>
                ))}
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
  madhahsGrid: { gap: 16 },
  madhahCard: { borderRadius: 12, overflow: 'hidden', borderLeftWidth: 4 },
  madhahHeader: { padding: 12 },
  madhahName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  madhahRules: { padding: 12, backgroundColor: 'rgba(0,0,0,0.02)' },
  ruleItem: { marginBottom: 10 },
  ruleName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  ruleDesc: { fontSize: 12, opacity: 0.8 },
});
