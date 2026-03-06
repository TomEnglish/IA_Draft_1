import { GenerateQRModal } from '@/components/modals/GenerateQRModal';
import { QRDetailModal } from '@/components/modals/QRDetailModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  batchCreateQRCodes,
  fetchQRCodeDetail,
  fetchQRCodes,
  type QRCodeRecord,
} from '@/lib/api/qrcodes';
import { useAuthStore } from '@/stores/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Print from 'expo-print';
import { useFocusEffect } from 'expo-router';
import QRCode from 'qrcode';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function QRCodesScreen() {
  const activeProject = useAuthStore((s) => s.activeProject);
  const [qrCodes, setQRCodes] = useState<QRCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const [showGenerate, setShowGenerate] = useState(false);
  const [batchCount, setBatchCount] = useState('10');
  const [generating, setGenerating] = useState(false);
  const [printing, setPrinting] = useState(false);

  // Detail modal
  const [detailQR, setDetailQR] = useState<QRCodeRecord | null>(null);
  const [detailMaterial, setDetailMaterial] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    offsetRef.current = 0;
    try {
      const result = await fetchQRCodes({ offset: 0 });
      setQRCodes(result.data);
      setHasMore(result.hasMore);
      offsetRef.current = result.data.length;
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchQRCodes({ offset: offsetRef.current });
      setQRCodes((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      offsetRef.current += result.data.length;
    } catch { }
    setLoadingMore(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [activeProject?.id])
  );

  const handleGenerate = async () => {
    const count = parseInt(batchCount, 10);
    if (!count || count < 1 || count > 100) {
      Alert.alert('Error', 'Enter a number between 1 and 100');
      return;
    }
    setGenerating(true);
    try {
      await batchCreateQRCodes(count);
      setShowGenerate(false);
      load();
      Alert.alert('Success', `${count} QR codes created`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setGenerating(false);
  };

  const handlePrintLabels = async (codes: QRCodeRecord[]) => {
    setPrinting(true);
    try {
      // Generate QR code SVGs
      const qrSvgs = await Promise.all(
        codes.map(async (code) => {
          const svg = await QRCode.toString(code.code_value, {
            type: 'svg',
            width: 150,
            margin: 1,
          });
          return { code: code.code_value, svg };
        })
      );

      // Build printable HTML
      const labelsHtml = qrSvgs
        .map(
          (item) => `
        <div class="label">
          ${item.svg}
          <p>${item.code}</p>
        </div>
      `
        )
        .join('');

      const html = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; margin: 0; padding: 10px; }
              .grid { display: flex; flex-wrap: wrap; gap: 10px; }
              .label {
                width: 180px;
                text-align: center;
                border: 1px solid #ccc;
                padding: 10px;
                page-break-inside: avoid;
              }
              .label svg { width: 150px; height: 150px; }
              .label p { font-size: 10px; margin: 4px 0 0; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="grid">${labelsHtml}</div>
          </body>
        </html>
      `;

      await Print.printAsync({ html });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setPrinting(false);
  };

  const openDetail = async (qr: QRCodeRecord) => {
    try {
      const { qr: detail, material } = await fetchQRCodeDetail(qr.id);
      setDetailQR(detail);
      setDetailMaterial(material);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const unlinked = qrCodes.filter((q) => !q.entity_id);

  const renderItem = ({ item }: { item: QRCodeRecord }) => (
    <Card
      style={{ ...styles.card, ...(!item.entity_id ? styles.cardUnlinked : {}) }}
      onPress={() => openDetail(item)}
    >
      <View style={styles.cardRow}>
        <FontAwesome
          name="qrcode"
          size={20}
          color={item.entity_id ? '#16A34A' : '#94A3B8'}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.codeText}>{item.code_value}</Text>
          <Text style={styles.statusLabel}>
            {item.entity_id ? 'Linked' : 'Available'}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Showing {qrCodes.length} / {unlinked.length} available
        </Text>
        <View style={styles.headerActions}>
          <Button
            title="Print"
            variant="secondary"
            onPress={() => handlePrintLabels(unlinked.length > 0 ? unlinked : qrCodes)}
            loading={printing}
            style={styles.headerBtn}
          />
          <Button
            title="+ Generate"
            onPress={() => setShowGenerate(true)}
            style={styles.headerBtn}
          />
        </View>
      </View>

      <FlatList
        data={qrCodes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 12 }} /> : null}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome name="qrcode" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No QR codes generated yet</Text>
          </View>
        }
      />

      <GenerateQRModal
        visible={showGenerate}
        batchCount={batchCount}
        setBatchCount={setBatchCount}
        generating={generating}
        onGenerate={handleGenerate}
        onCancel={() => setShowGenerate(false)}
      />

      <QRDetailModal
        visible={!!detailQR}
        code={detailQR}
        material={detailMaterial}
        onPrint={handlePrintLabels}
        onClose={() => {
          setDetailQR(null);
          setDetailMaterial(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 13, color: '#64748B' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  list: { padding: 12, paddingBottom: 40 },
  card: {
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cardUnlinked: { borderColor: '#CBD5E1', borderStyle: 'dashed' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardInfo: { flex: 1 },
  codeText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  statusLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#94A3B8', marginTop: 12 },
});
