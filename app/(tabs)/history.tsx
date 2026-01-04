import { View, StyleSheet, Pressable, FlatList, Text, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { getSavedReports, deleteSavedReport, type SavedReport } from '@/lib/report';
import * as Sharing from 'expo-sharing';

export default function HistoryScreen() {
  const [reports, setReports] = useState<SavedReport[]>([]);

  const load = async () => {
    const list = await getSavedReports();
    setReports(list);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    const ok = await deleteSavedReport(id);
    if (ok) load();
  };

  const onShare = async (r: SavedReport) => {
    try {
      await Sharing.shareAsync(r.path, { mimeType: r.type === 'pdf' ? 'application/pdf' : 'text/csv' });
    } catch (e) {
      Alert.alert('فشل المشاركة');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText style={styles.meta}>{item.madhab} • {new Date(item.createdAt).toLocaleString()}</ThemedText>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => onShare(item)} style={[styles.actionButton, styles.share]}>
                <ThemedText style={styles.actionText}>مشاركة</ThemedText>
              </Pressable>
              <Pressable onPress={() => onDelete(item.id)} style={[styles.actionButton, styles.delete]}>
                <ThemedText style={styles.actionText}>حذف</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <ThemedText>لا توجد تقارير محفوظة.</ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  share: { backgroundColor: '#2563eb' },
  delete: { backgroundColor: '#ef4444', marginLeft: 8 },
  actionText: { color: '#fff', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 32 },
});
