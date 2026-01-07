import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const AUDIT_LOGS = [
  {
    id: '1',
    date: '2026-01-07',
    time: '14:30',
    madhab: 'الشافعي',
    heirs: 'زوج، أم، أخت',
    estate: '100,000 ريال',
    status: 'مكتمل',
  },
  {
    id: '2',
    date: '2026-01-06',
    time: '10:15',
    madhab: 'الحنفي',
    heirs: 'بنت، أب، أم',
    estate: '500,000 ريال',
    status: 'مكتمل',
  },
  {
    id: '3',
    date: '2026-01-05',
    time: '16:45',
    madhab: 'المالكي',
    heirs: 'زوجة، ابن، ابنة',
    estate: '250,000 ريال',
    status: 'مكتمل',
  },
  {
    id: '4',
    date: '2026-01-04',
    time: '09:20',
    madhab: 'الحنبلي',
    heirs: 'أخ، أخت، عم',
    estate: '75,000 ريال',
    status: 'مكتمل',
  },
];

export default function AuditScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>📋 سجل المراجعة</ThemedText>
        <ThemedText style={styles.subtitle}>تتبع جميع الحسابات السابقة</ThemedText>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.tint }]}>
              {AUDIT_LOGS.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>إجمالي الحسابات</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#10b98120' }]}>
            <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#10b981' }]}>
              100%
            </ThemedText>
            <ThemedText style={styles.statLabel}>معدل النجاح</ThemedText>
          </View>
        </View>

        {/* Audit Logs */}
        <View style={styles.logsList}>
          {AUDIT_LOGS.map((log) => (
            <Pressable
              key={log.id}
              onPress={() => setExpandedId(expandedId === log.id ? null : log.id)}
              style={[styles.logCard, expandedId === log.id && styles.logCardExpanded]}
            >
              <View style={styles.logHeader}>
                <View>
                  <ThemedText type="defaultSemiBold" style={styles.logDate}>
                    {log.date} {log.time}
                  </ThemedText>
                  <ThemedText style={styles.logMadhab}>{log.madhab}</ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#10b98140' }]}>
                  <ThemedText style={[styles.statusText, { color: '#10b981' }]}>
                    {log.status}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.logSummary}>
                <ThemedText style={styles.logInfo}>👥 {log.heirs}</ThemedText>
                <ThemedText style={styles.logInfo}>💰 {log.estate}</ThemedText>
              </View>

              {expandedId === log.id && (
                <View style={styles.logDetails}>
                  <ThemedText type="defaultSemiBold" style={styles.detailsTitle}>
                    التفاصيل الكاملة
                  </ThemedText>
                  <ThemedText style={styles.detailsText}>
                    المذهب: {log.madhab}
                  </ThemedText>
                  <ThemedText style={styles.detailsText}>
                    الورثة: {log.heirs}
                  </ThemedText>
                  <ThemedText style={styles.detailsText}>
                    التركة: {log.estate}
                  </ThemedText>
                  <View style={styles.actionButtons}>
                    <Pressable style={[styles.actionButton, { backgroundColor: colors.tint + '20' }]}>
                      <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
                        إعادة الحساب
                      </ThemedText>
                    </Pressable>
                    <Pressable style={[styles.actionButton, { backgroundColor: '#ef444420' }]}>
                      <ThemedText style={[styles.actionButtonText, { color: '#ef4444' }]}>
                        حذف
                      </ThemedText>
                    </Pressable>
                  </View>
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
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  statValue: { fontSize: 20, marginBottom: 4 },
  statLabel: { fontSize: 12, opacity: 0.7 },
  logsList: { gap: 12 },
  logCard: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.02)', borderWidth: 1, borderColor: '#e5e7eb' },
  logCardExpanded: { backgroundColor: 'rgba(0,0,0,0.04)' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  logDate: { fontSize: 14, marginBottom: 4 },
  logMadhab: { fontSize: 12, opacity: 0.7 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  logSummary: { gap: 4 },
  logInfo: { fontSize: 13, opacity: 0.8 },
  logDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  detailsTitle: { fontSize: 14, marginBottom: 8 },
  detailsText: { fontSize: 12, opacity: 0.7, marginBottom: 4 },
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  actionButtonText: { fontSize: 12, fontWeight: '600' },
});
