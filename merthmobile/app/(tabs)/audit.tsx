import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import {
  searchCalculations,
  formatDateTime,
  getRelativeTime,
  FilterOptions,
} from '@/lib/search-filter';
import { showToast } from '@/components/common/Toast';

const MADHABS = [
  { id: 'shafii', name: 'الشافعي', color: '#059669' },
  { id: 'hanafi', name: 'الحنفي', color: '#dc2626' },
  { id: 'maliki', name: 'المالكي', color: '#a855f7' },
  { id: 'hanbali', name: 'الحنبلي', color: '#0ea5e9' },
];

// Fallback data for demonstration
const DEMO_LOGS = [
  {
    id: '1',
    madhab: 'shafii',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    estate: { total: 100000, costs: 0, debts: 0, will: 0 },
    heirs: [{ name: 'زوج', count: 1 }, { name: 'أم', count: 1 }],
    result: {},
  },
  {
    id: '2',
    madhab: 'hanafi',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    estate: { total: 500000, costs: 5000, debts: 10000, will: 0 },
    heirs: [{ name: 'بنت', count: 1 }, { name: 'أب', count: 1 }],
    result: {},
  },
];

export default function AuditScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { history, loading } = useCalculationHistory();

  const [searchText, setSearchText] = useState('');
  const [selectedMadhab, setSelectedMadhab] = useState<string | null>(null);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayHistory = history.length > 0 ? history : DEMO_LOGS;

  // Update filtered results when history or filters change
  useEffect(() => {
    const options: FilterOptions = {
      madhab: selectedMadhab || undefined,
      searchText: searchText || undefined,
    };

    const results = searchCalculations(displayHistory, options);
    setFilteredResults(results.records);
  }, [displayHistory, searchText, selectedMadhab]);

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedMadhab(null);
    showToast('تم مسح الفلاتر', 'info');
  };

  const getMadhhabName = (madhab: string) => {
    return MADHABS.find(m => m.id === madhab)?.name || madhab;
  };

  const getMadhhabColor = (madhab: string) => {
    return MADHABS.find(m => m.id === madhab)?.color || '#999';
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
    const isExpanded = expandedId === item.id;
    const madhab = MADHABS.find(m => m.id === item.madhab);

    return (
      <View style={styles.itemContainer}>
        <Pressable
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          style={[styles.itemHeader, { borderLeftColor: madhab?.color || '#999' }]}
        >
          <View style={styles.itemHeaderContent}>
            <ThemedText type="defaultSemiBold" style={styles.madhab}>
              {madhab?.name || item.madhab}
            </ThemedText>
            <ThemedText style={styles.time}>
              {getRelativeTime(new Date(item.timestamp))}
            </ThemedText>
          </View>
          <ThemedText style={styles.arrow}>{isExpanded ? '▼' : '▶'}</ThemedText>
        </Pressable>

        {isExpanded && (
          <View style={styles.itemDetails}>
            <View style={styles.detailRow}>
              <ThemedText type="defaultSemiBold">التاريخ والوقت:</ThemedText>
              <ThemedText>{formatDateTime(new Date(item.timestamp))}</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText type="defaultSemiBold">إجمالي التركة:</ThemedText>
              <ThemedText>{item.estate.total.toLocaleString()} ريال</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText type="defaultSemiBold">عدد الورثة:</ThemedText>
              <ThemedText>{item.heirs.length}</ThemedText>
            </View>

            {item.heirs.length > 0 && (
              <View style={styles.heirsSection}>
                <ThemedText type="defaultSemiBold" style={styles.heirsTitle}>
                  الورثة:
                </ThemedText>
                {item.heirs.map((heir: any, idx: number) => (
                  <ThemedText key={idx} style={styles.heirItem}>
                    • {heir.name} ({heir.count})
                  </ThemedText>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📋 سجل الحسابات
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            ابحث عن الحسابات السابقة وفلترها
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
                borderColor: colors.icon,
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
              },
            ]}
            placeholder="ابحث عن حسابات..."
            placeholderTextColor={colors.icon}
            value={searchText}
            onChangeText={setSearchText}
            textAlign="right"
          />
        </View>

        {/* Madhab Filter */}
        <View style={styles.filterSection}>
          <ThemedText type="defaultSemiBold" style={styles.filterTitle}>
            فلتر حسب المذهب:
          </ThemedText>
          <View style={styles.madhahFilterGrid}>
            {MADHABS.map(madhab => (
              <Pressable
                key={madhab.id}
                onPress={() =>
                  setSelectedMadhab(selectedMadhab === madhab.id ? null : madhab.id)
                }
                style={[
                  styles.madhahFilterButton,
                  {
                    backgroundColor: madhab.color,
                    opacity: selectedMadhab === madhab.id ? 1 : 0.5,
                  },
                ]}
              >
                <ThemedText style={styles.madhahFilterText}>{madhab.name}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Clear Filters Button */}
        {(searchText || selectedMadhab) && (
          <Pressable style={styles.clearButton} onPress={handleClearFilters}>
            <ThemedText style={styles.clearButtonText}>مسح الفلاتر</ThemedText>
          </Pressable>
        )}

        {/* Results Count */}
        <View style={styles.resultsInfo}>
          <ThemedText style={styles.resultsText}>
            {filteredResults.length} من {displayHistory.length} حساب
          </ThemedText>
        </View>

        {/* History List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : filteredResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {displayHistory.length === 0
                ? 'لا توجد حسابات سابقة'
                : 'لم يتم العثور على نتائج'}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredResults}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'right',
  },
  searchSection: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterSection: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  filterTitle: {
    marginBottom: 8,
    fontSize: 14,
    textAlign: 'right',
  },
  madhahFilterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  madhahFilterButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  madhahFilterText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsInfo: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  resultsText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  listContent: {
    gap: 8,
  },
  itemContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 4,
  },
  itemHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  madhab: {
    fontSize: 14,
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    opacity: 0.6,
  },
  arrow: {
    fontSize: 12,
  },
  itemDetails: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heirsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  heirsTitle: {
    marginBottom: 8,
    textAlign: 'right',
  },
  heirItem: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'right',
  },
});
