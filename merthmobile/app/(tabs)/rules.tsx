import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const FIQH_RULES = [
  {
    id: '1',
    title: 'أنواع الوارثين',
    description: 'ينقسم الوارثون إلى ثلاثة أقسام: أصحاب فروض، عصبة، وذوو أرحام',
    details: 'أصحاب الفروض: لهم نصيب محدد في القرآن الكريم. العصبة: يرثون بالتعصيب. ذوو الأرحام: يرثون عند عدم الوارثين.',
  },
  {
    id: '2',
    title: 'الفروض المقررة',
    description: 'الفروض المقررة في الشريعة الإسلامية هي: النصف، الربع، الثمن، الثلث، الثلثان، السدس',
    details: 'النصف: للبنت الواحدة والزوج. الربع: للزوجة والزوج. الثمن: للزوجة. الثلث: للأم والإخوة. الثلثان: للبنات والأخوات. السدس: للأب والأم والجد والأخت.',
  },
  {
    id: '3',
    title: 'الحجب',
    description: 'منع وارث من الإرث كلياً أو جزئياً بسبب وجود وارث آخر',
    details: 'الحجب الكلي: منع الوارث من الإرث تماماً. الحجب الجزئي: تقليل نصيب الوارث بسبب وجود وارث آخر.',
  },
  {
    id: '4',
    title: 'التعصيب',
    description: 'الإرث بلا تقدير، حيث يأخذ العاصب ما تبقى من التركة بعد أصحاب الفروض',
    details: 'العاصب قد يكون بنفسه (كالابن)، أو بغيره (كالأخت مع الأخ)، أو مع غيره (كالأب مع الابن).',
  },
  {
    id: '5',
    title: 'الرد',
    description: 'إعادة ما تبقى من التركة إلى أصحاب الفروض إذا لم يوجد عاصب',
    details: 'الرد يتم توزيعه على أصحاب الفروض بنسبة فروضهم، مع استثناء الزوج والزوجة في أغلب المذاهب.',
  },
  {
    id: '6',
    title: 'العول',
    description: 'زيادة مقدار الفروض عن أصل المسألة',
    details: 'عندما تزيد الفروض على التركة، يتم تقليل نصيب كل وارث بنسبة متساوية. هذا يختلف بين المذاهب.',
  },
];

export default function RulesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>📚 القواعد الفقهية</ThemedText>
        <ThemedText style={styles.subtitle}>شرح مفصل للقواعد الفقهية في الميراث</ThemedText>

        <View style={styles.rulesList}>
          {FIQH_RULES.map((rule) => (
            <Pressable
              key={rule.id}
              onPress={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
              style={[styles.ruleCard, expandedId === rule.id && styles.ruleCardExpanded]}
            >
              <View style={styles.ruleHeader}>
                <View style={[styles.ruleIcon, { backgroundColor: colors.tint + '20' }]}>
                  <ThemedText style={[styles.ruleNumber, { color: colors.tint }]}>
                    {rule.id}
                  </ThemedText>
                </View>
                <View style={styles.ruleHeaderText}>
                  <ThemedText type="defaultSemiBold" style={styles.ruleTitle}>
                    {rule.title}
                  </ThemedText>
                  <ThemedText style={styles.ruleDesc}>
                    {rule.description}
                  </ThemedText>
                </View>
              </View>

              {expandedId === rule.id && (
                <View style={styles.ruleDetails}>
                  <ThemedText style={styles.ruleDetailsText}>
                    {rule.details}
                  </ThemedText>
                </View>
              )}
            </Pressable>
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
  rulesList: { gap: 12 },
  ruleCard: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.02)', borderWidth: 1, borderColor: '#e5e7eb' },
  ruleCardExpanded: { backgroundColor: 'rgba(0,0,0,0.04)' },
  ruleHeader: { flexDirection: 'row', gap: 12 },
  ruleIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  ruleNumber: { fontSize: 16, fontWeight: 'bold' },
  ruleHeaderText: { flex: 1 },
  ruleTitle: { fontSize: 16, marginBottom: 4 },
  ruleDesc: { fontSize: 13, opacity: 0.7, lineHeight: 18 },
  ruleDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  ruleDetailsText: { fontSize: 13, lineHeight: 20, opacity: 0.8 },
});
