import { Card } from '@/components/ui/Card';
import {
  fetchInventoryByType,
  fetchKPIs,
  fetchYardOverview,
  type InventoryByType,
  type KPIData,
  type YardLocation,
} from '@/lib/api/dashboard';
import { useAuthStore } from '@/stores/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/design/tokens';

export default function DashboardScreen() {
  const activeProject = useAuthStore((s) => s.activeProject);
  const [kpis, setKPIs] = useState<KPIData | null>(null);
  const [byType, setByType] = useState<InventoryByType[]>([]);
  const [yardOverview, setYardOverview] = useState<YardLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [k, t, y] = await Promise.all([
        fetchKPIs(),
        fetchInventoryByType(),
        fetchYardOverview(),
      ]);
      setKPIs(k);
      setByType(t);
      setYardOverview(y);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [activeProject?.id])
  );

  const maxTypeCount = Math.max(...byType.map((t) => t.item_count), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <KPICard
          icon="cubes"
          label="In Yard"
          value={kpis?.totalInYard ?? 0}
          subvalue={`${kpis?.totalQuantityInYard ?? 0} total qty`}
          color={colors.brandPrimary}
        />
        <KPICard
          icon="list"
          label="All Materials"
          value={kpis?.totalMaterials ?? 0}
          color={colors.textMuted}
        />
        <KPICard
          icon="exclamation-triangle"
          label="Open Exceptions"
          value={kpis?.openExceptions ?? 0}
          color={kpis?.openExceptions ? colors.danger : colors.success}
        />
        <KPICard
          icon="clock-o"
          label="Aging > 30d"
          value={kpis?.agingOver30 ?? 0}
          subvalue={`${kpis?.agingOver90 ?? 0} over 90d`}
          color={colors.warn}
        />
      </View>

      {/* Inventory by Type */}
      <Text style={styles.sectionTitle}>Inventory by Type</Text>
      <Card style={{ marginBottom: 16 }}>
        {byType.length === 0 ? (
          <Text style={styles.emptyText}>No materials in yard</Text>
        ) : (
          byType.map((t) => (
            <View key={t.material_type} style={styles.barRow}>
              <Text style={styles.barLabel}>{t.material_type}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(t.item_count / maxTypeCount) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{t.item_count}</Text>
            </View>
          ))
        )}
      </Card>

      {/* Yard Overview */}
      <Text style={styles.sectionTitle}>Yard Overview</Text>
      <Card>
        {yardOverview.length === 0 ? (
          <Text style={styles.emptyText}>No locations configured</Text>
        ) : (
          yardOverview.map((loc) => (
            <View key={loc.location_id} style={styles.locationRow}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>
                  {loc.zone} - R{loc.row}/Rk{loc.rack}
                </Text>
                {loc.is_hold_area && <Text style={styles.holdBadge}>HOLD</Text>}
              </View>
              <Text style={styles.locationCount}>
                {loc.items_stored} items ({loc.total_quantity} qty)
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

function KPICard({
  icon,
  label,
  value,
  subvalue,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  subvalue?: string;
  color: string;
}) {
  return (
    <Card style={styles.kpiCard}>
      <FontAwesome name={icon} size={20} color={color} />
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {subvalue && <Text style={styles.kpiSub}>{subvalue}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 16, paddingBottom: 40 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  kpiValue: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  kpiLabel: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  kpiSub: { fontSize: 11, color: colors.textSubtle, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  barLabel: { width: 100, fontSize: 13, color: colors.textPrimary },
  barTrack: {
    flex: 1,
    height: 16,
    backgroundColor: colors.raised,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.brandPrimary,
    borderRadius: 4,
  },
  barValue: { width: 30, fontSize: 13, color: colors.textPrimary, fontWeight: '600', textAlign: 'right' },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.raised,
  },
  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationName: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  holdBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  locationCount: { fontSize: 13, color: colors.textMuted },
  emptyText: { fontSize: 14, color: colors.textSubtle, textAlign: 'center', paddingVertical: 12 },
});
