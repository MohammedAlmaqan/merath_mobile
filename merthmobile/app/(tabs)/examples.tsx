import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { QUICK_EXAMPLES } from '@/lib/quick-examples';
import { useInheritanceCalculator } from '@/hooks/useInheritanceCalculator';

export default function ExamplesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const calculator = useInheritanceCalculator();
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const handleLoadExample = (exampleId: string) => {
    const example = QUICK_EXAMPLES.find(ex => ex.id === exampleId);
    if (!example) return;

    // Load the example data into the calculator
    calculator.setEstateField('total', example.estate.total);
    calculator.setEstateField('funeral', example.estate.funeral);
    calculator.setEstateField('debts', example.estate.debts);
    calculator.setEstateField('will', example.estate.will);
    
    // Load heirs
    Object.entries(example.heirs).forEach(([key, count]) => {
      calculator.setHeirCount(key as keyof typeof example.heirs, count);
    });
    
    Alert.alert(
      'تم التحميل',
      `تم تحميل الحالة: ${example.name}\n\nاضغط على "حساب" لرؤية النتائج`,
      [
        {
          text: 'إغلاق',
          onPress: () => {
            // Navigate to calculator tab
            router.push('/(tabs)');
          },
        },
      ]
    );
  };

  const renderExampleCard = ({ item }: { item: typeof QUICK_EXAMPLES[0] }) => (
    <ThemedView style={[styles.exampleCard, { borderLeftColor: colors.tint }]}>
      <View style={styles.exampleHeader}>
        <ThemedText style={styles.exampleTitle}>{item.name}</ThemedText>
        <ThemedText style={styles.exampleId}>#{item.id.split('-')[1]}</ThemedText>
      </View>

      <ThemedText style={styles.exampleDescription}>
        {item.description}
      </ThemedText>

      <View style={styles.exampleDetails}>
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>التركة:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {item.estate.total.toLocaleString()} ريال
          </ThemedText>
        </View>

        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>عدد الورثة:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {Object.values(item.heirs).reduce((sum, count) => sum + count, 0)}
          </ThemedText>
        </View>
      </View>

      <Pressable
        onPress={() => handleLoadExample(item.id)}
        style={[styles.loadButton, { backgroundColor: colors.tint }]}
      >
        <ThemedText style={styles.loadButtonText}>📥 تحميل المثال</ThemedText>
      </Pressable>
    </ThemedView>
  );

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>أمثلة سريعة</ThemedText>
          <ThemedText style={styles.subtitle}>
            اختر أحد الأمثلة وحمّلها لاختبار الحاسبة
          </ThemedText>
        </View>

        {/* Info Box */}
        <ThemedView style={styles.infoBox}>
          <ThemedText style={styles.infoText}>
            💡 هذه الأمثلة تغطي حالات إرث مختلفة من البسيطة إلى المعقدة. اختر أي مثال وسيتم ملء جميع الحقول تلقائياً.
          </ThemedText>
        </ThemedView>

        {/* Examples List */}
        <FlatList
          data={QUICK_EXAMPLES}
          keyExtractor={item => item.id}
          renderItem={renderExampleCard}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* Footer */}
        <ThemedView style={styles.footerBox}>
          <ThemedText style={styles.footerTitle}>ملاحظات مهمة:</ThemedText>
          <ThemedText style={styles.footerText}>
            • كل مثال يحتوي على بيانات حقيقية لحالات إرث فعلية{'\n'}
            • يمكنك تعديل البيانات بعد تحميل المثال{'\n'}
            • جميع الحسابات تتم وفقاً للمذهب المختار{'\n'}
            • استخدم هذه الأمثلة للتعلم والتدريب
          </ThemedText>
        </ThemedView>
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
  },
  header: {
    marginBottom: 24,
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
  infoBox: {
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  exampleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  exampleId: {
    fontSize: 12,
    opacity: 0.6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  exampleDescription: {
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 18,
  },
  exampleDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 6,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  separator: {
    height: 8,
  },
  footerBox: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.7,
  },
});
