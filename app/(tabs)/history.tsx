import { View, StyleSheet, Pressable, FlatList, Text, Alert, Modal, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { getSavedReports, deleteSavedReport, type SavedReport } from '@/lib/report';
import * as Sharing from 'expo-sharing';
import { useCallback } from 'react';
import { WebView } from 'react-native-webview';


export default function HistoryScreen() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  const onPreview = useCallback(async (r: SavedReport) => {
    setLoadingPreview(true);
    try {
      if (r.type === 'pdf') {
        setPreviewUri(r.path);
        setPreviewVisible(true);
      } else {
        // CSV preview: read file contents
        const FileSystem = await import('expo-file-system');
        // @ts-ignore
        const content = await FileSystem.readAsStringAsync(r.path, { encoding: FileSystem.EncodingType.UTF8 });
        setPreviewUri('data:text/plain;base64,' + Buffer.from(content).toString('base64'));
        setPreviewVisible(true);
      }
    } catch (e) {
      Alert.alert('فشل التحميل');
    } finally {
      setLoadingPreview(false);
    }
  }, []);

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
              <Pressable onPress={() => onPreview(item)} style={[styles.actionButton, { backgroundColor: '#0ea5e9' }]}>
                <ThemedText style={styles.actionText}>عرض</ThemedText>
              </Pressable>
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
      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <ThemedView style={{ flex: 1 }}>
          <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText type="defaultSemiBold">معاينة التقرير</ThemedText>
            <Pressable onPress={() => setPreviewVisible(false)} style={{ padding: 8 }}>
              <ThemedText>إغلاق</ThemedText>
            </Pressable>
          </View>
          {loadingPreview ? (
            <ActivityIndicator />
          ) : previewUri ? (
            previewUri.startsWith('data:') ? (
              <WebView originWhitelist={["*"]} source={{ uri: previewUri }} style={{ flex: 1 }} />
            ) : (
              <WebView originWhitelist={["*"]} source={{ uri: previewUri }} style={{ flex: 1 }} />
            )
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ThemedText>لا يوجد ملف للمعاينة</ThemedText>
            </View>
          )}
        </ThemedView>
      </Modal>
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
