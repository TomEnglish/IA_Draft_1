import { AdminEditModal, type ColumnConfig } from '@/components/modals/AdminEditModal';
import { Button } from '@/components/ui/Button';
import { deleteRecord, fetchTableData, insertRecord, updateRecord } from '@/lib/api/admin';
import { useAuthStore } from '@/stores/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------------------------------------------------------------------------
// Table configurations
// ---------------------------------------------------------------------------

interface TableConfig {
  key: string;
  label: string;
  columns: ColumnConfig[];
  searchColumns: string[];
  canInsert: boolean;
  canDelete: boolean;
  idField: string;
  orderBy: string;
  orderAsc: boolean;
}

const TABLE_CONFIGS: TableConfig[] = [
  {
    key: 'materials',
    label: 'Materials',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'material_type', label: 'Type', editable: true, type: 'text' },
      { key: 'size', label: 'Size', editable: true, type: 'text' },
      { key: 'grade', label: 'Grade', editable: true, type: 'text' },
      { key: 'spec', label: 'Spec', editable: true, type: 'text' },
      { key: 'qty', label: 'Qty', editable: true, type: 'number' },
      { key: 'current_quantity', label: 'Current Qty', editable: true, type: 'number' },
      { key: 'weight', label: 'Weight', editable: true, type: 'number' },
      { key: 'status', label: 'Status', editable: true, type: 'enum', options: ['in_yard', 'issued', 'shipped', 'depleted'] },
      { key: 'location_id', label: 'Location ID', editable: true, type: 'text' },
      { key: 'qr_code_id', label: 'QR Code ID', editable: false, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['material_type', 'grade', 'spec'],
    canInsert: false,
    canDelete: false,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'receiving_records',
    label: 'Receiving',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'po_number', label: 'PO Number', editable: true, type: 'text' },
      { key: 'carrier', label: 'Carrier', editable: true, type: 'text' },
      { key: 'status', label: 'Status', editable: true, type: 'enum', options: ['pending', 'inspecting', 'completed', 'rejected'] },
      { key: 'received_by', label: 'Received By', editable: false, type: 'text' },
      { key: 'notes', label: 'Notes', editable: true, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['po_number', 'carrier'],
    canInsert: false,
    canDelete: false,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'locations',
    label: 'Locations',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'zone', label: 'Zone', editable: true, type: 'text' },
      { key: 'row', label: 'Row', editable: true, type: 'text' },
      { key: 'rack', label: 'Rack', editable: true, type: 'text' },
      { key: 'description', label: 'Description', editable: true, type: 'text' },
      { key: 'is_active', label: 'Active', editable: true, type: 'boolean' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['zone', 'row', 'rack', 'description'],
    canInsert: true,
    canDelete: true,
    idField: 'id',
    orderBy: 'zone',
    orderAsc: true,
  },
  {
    key: 'qr_codes',
    label: 'QR Codes',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'code_value', label: 'Code', editable: false, type: 'text' },
      { key: 'entity_type', label: 'Entity Type', editable: true, type: 'enum', options: ['material', 'location'] },
      { key: 'entity_id', label: 'Entity ID', editable: true, type: 'text' },
      { key: 'is_active', label: 'Active', editable: true, type: 'boolean' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['code_value'],
    canInsert: false,
    canDelete: false,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'material_movements',
    label: 'Movements',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'material_id', label: 'Material ID', editable: false, type: 'text' },
      { key: 'from_location_id', label: 'From Location', editable: false, type: 'text' },
      { key: 'to_location_id', label: 'To Location', editable: false, type: 'text' },
      { key: 'moved_by', label: 'Moved By', editable: false, type: 'text' },
      { key: 'reason', label: 'Reason', editable: false, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['material_id', 'reason'],
    canInsert: false,
    canDelete: false,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'material_issues',
    label: 'Issues',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'material_id', label: 'Material ID', editable: false, type: 'text' },
      { key: 'job_number', label: 'Job Number', editable: true, type: 'text' },
      { key: 'work_order', label: 'Work Order', editable: true, type: 'text' },
      { key: 'quantity_issued', label: 'Qty Issued', editable: false, type: 'number' },
      { key: 'issued_by', label: 'Issued By', editable: false, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['job_number', 'work_order'],
    canInsert: false,
    canDelete: false,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'shipments_out',
    label: 'Shipments Out',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'shipment_number', label: 'Shipment #', editable: true, type: 'text' },
      { key: 'destination', label: 'Destination', editable: true, type: 'text' },
      { key: 'carrier', label: 'Carrier', editable: true, type: 'text' },
      { key: 'status', label: 'Status', editable: true, type: 'enum', options: ['pending', 'in_transit', 'delivered'] },
      { key: 'shipped_by', label: 'Shipped By', editable: false, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['shipment_number', 'destination', 'carrier'],
    canInsert: true,
    canDelete: false,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'purchase_orders',
    label: 'POs',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'po_number', label: 'PO Number', editable: true, type: 'text' },
      { key: 'vendor', label: 'Vendor', editable: true, type: 'text' },
      { key: 'status', label: 'Status', editable: true, type: 'enum', options: ['draft', 'submitted', 'acknowledged', 'shipped', 'received', 'closed'] },
      { key: 'notes', label: 'Notes', editable: true, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['po_number', 'vendor'],
    canInsert: true,
    canDelete: true,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'shipments',
    label: 'Shipments',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'po_id', label: 'PO ID', editable: true, type: 'text' },
      { key: 'tracking_number', label: 'Tracking #', editable: true, type: 'text' },
      { key: 'carrier', label: 'Carrier', editable: true, type: 'text' },
      { key: 'status', label: 'Status', editable: true, type: 'enum', options: ['pending', 'in_transit', 'delivered'] },
      { key: 'expected_date', label: 'Expected Date', editable: true, type: 'date' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['tracking_number', 'carrier'],
    canInsert: false,
    canDelete: false,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'material_links',
    label: 'Material Links',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'material_id', label: 'Material ID', editable: true, type: 'text' },
      { key: 'shipment_id', label: 'Shipment ID', editable: true, type: 'text' },
      { key: 'receiving_record_id', label: 'Receiving ID', editable: true, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['material_id'],
    canInsert: false,
    canDelete: false,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'delivery_dates',
    label: 'Delivery Dates',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'po_id', label: 'PO ID', editable: true, type: 'text' },
      { key: 'promised_date', label: 'Promised', editable: true, type: 'date' },
      { key: 'actual_date', label: 'Actual', editable: true, type: 'date' },
      { key: 'notes', label: 'Notes', editable: true, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['notes'],
    canInsert: true,
    canDelete: true,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'audit_log',
    label: 'Audit Log',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'user_id', label: 'User ID', editable: false, type: 'text' },
      { key: 'action', label: 'Action', editable: false, type: 'text' },
      { key: 'entity_type', label: 'Entity Type', editable: false, type: 'text' },
      { key: 'entity_id', label: 'Entity ID', editable: false, type: 'text' },
      { key: 'details', label: 'Details', editable: false, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['action', 'entity_type'],
    canInsert: false,
    canDelete: false,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
  {
    key: 'project_schedule',
    label: 'Schedule',
    columns: [
      { key: 'id', label: 'ID', editable: false, type: 'text' },
      { key: 'task_name', label: 'Task', editable: true, type: 'text' },
      { key: 'start_date', label: 'Start', editable: true, type: 'date' },
      { key: 'end_date', label: 'End', editable: true, type: 'date' },
      { key: 'status', label: 'Status', editable: true, type: 'enum', options: ['not_started', 'in_progress', 'completed', 'on_hold'] },
      { key: 'assigned_to', label: 'Assigned To', editable: true, type: 'text' },
      { key: 'notes', label: 'Notes', editable: true, type: 'text' },
      { key: 'created_at', label: 'Created', editable: false, type: 'date' },
    ],
    searchColumns: ['task_name', 'assigned_to'],
    canInsert: true,
    canDelete: true,
    idField: 'id',
    orderBy: 'created_at',
    orderAsc: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ENUM_COLORS: Record<string, string> = {
  in_yard: '#16A34A',
  issued: '#D97706',
  shipped: '#2563EB',
  depleted: '#94A3B8',
  pending: '#D97706',
  inspecting: '#2563EB',
  completed: '#16A34A',
  rejected: '#DC2626',
  draft: '#94A3B8',
  submitted: '#D97706',
  acknowledged: '#2563EB',
  received: '#16A34A',
  closed: '#64748B',
  in_transit: '#2563EB',
  delivered: '#16A34A',
  not_started: '#94A3B8',
  in_progress: '#D97706',
  on_hold: '#DC2626',
};

function badgeColor(value: string): string {
  return ENUM_COLORS[value] ?? '#64748B';
}

function formatValue(value: any, type: string): string {
  if (value == null) return '-';
  if (type === 'boolean') return value ? 'Yes' : 'No';
  if (type === 'date') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// ---------------------------------------------------------------------------
// Screen component
// ---------------------------------------------------------------------------

export function AdminScreen() {
  const activeProject = useAuthStore((s) => s.activeProject);
  const [selectedTable, setSelectedTable] = useState(TABLE_CONFIGS[0]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const offsetRef = useRef(0);

  // Modal state
  const [editRecord, setEditRecord] = useState<Record<string, any> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    offsetRef.current = 0;
    try {
      const result = await fetchTableData(selectedTable.key, {
        offset: 0,
        search: search || undefined,
        searchColumns: selectedTable.searchColumns,
        orderBy: selectedTable.orderBy,
        orderAsc: selectedTable.orderAsc,
      });
      setRecords(result.data);
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
      const result = await fetchTableData(selectedTable.key, {
        offset: offsetRef.current,
        search: search || undefined,
        searchColumns: selectedTable.searchColumns,
        orderBy: selectedTable.orderBy,
        orderAsc: selectedTable.orderAsc,
      });
      setRecords((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      offsetRef.current += result.data.length;
    } catch {}
    setLoadingMore(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [selectedTable.key, search, activeProject?.id])
  );

  const switchTable = (config: TableConfig) => {
    setSelectedTable(config);
    setSearch('');
  };

  const openEdit = (record: Record<string, any>) => {
    setEditRecord(record);
    setIsNew(false);
    setModalVisible(true);
  };

  const openNew = () => {
    setEditRecord(null);
    setIsNew(true);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditRecord(null);
    setIsNew(false);
  };

  const handleSave = async (changes: Record<string, any>) => {
    setSaving(true);
    try {
      if (isNew) {
        await insertRecord(selectedTable.key, changes);
      } else if (editRecord) {
        await updateRecord(
          selectedTable.key,
          selectedTable.idField,
          editRecord[selectedTable.idField],
          changes
        );
      }
      closeModal();
      load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editRecord) return;
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteRecord(
              selectedTable.key,
              selectedTable.idField,
              editRecord[selectedTable.idField]
            );
            closeModal();
            load();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
          setSaving(false);
        },
      },
    ]);
  };

  // Show first 5 columns in the card
  const displayColumns = selectedTable.columns.slice(0, 5);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} activeOpacity={0.7}>
      {displayColumns.map((col) => {
        const value = item[col.key];
        const isEnum = col.type === 'enum';
        const isBool = col.type === 'boolean';

        return (
          <View key={col.key} style={styles.cardRow}>
            <Text style={styles.cardLabel}>{col.label}</Text>
            {isEnum && value ? (
              <View style={[styles.statusBadge, { backgroundColor: badgeColor(value) + '20' }]}>
                <Text style={[styles.statusText, { color: badgeColor(value) }]}>
                  {String(value).replaceAll('_', ' ').toUpperCase()}
                </Text>
              </View>
            ) : isBool ? (
              <View style={[styles.statusBadge, { backgroundColor: value ? '#16A34A20' : '#94A3B820' }]}>
                <Text style={[styles.statusText, { color: value ? '#16A34A' : '#94A3B8' }]}>
                  {value ? 'YES' : 'NO'}
                </Text>
              </View>
            ) : (
              <Text style={styles.cardValue} numberOfLines={1}>
                {formatValue(value, col.type)}
              </Text>
            )}
          </View>
        );
      })}
      <Text style={styles.editHint}>Tap to edit</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${selectedTable.label}...`}
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Table picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {TABLE_CONFIGS.map((tc) => (
            <Button
              key={tc.key}
              title={tc.label}
              variant={selectedTable.key === tc.key ? 'primary' : 'secondary'}
              onPress={() => switchTable(tc)}
              style={styles.filterButton}
            />
          ))}
        </View>
      </ScrollView>

      {/* Add button */}
      {selectedTable.canInsert && (
        <TouchableOpacity style={styles.addBar} onPress={openNew} activeOpacity={0.7}>
          <FontAwesome name="plus-circle" size={18} color="#2563EB" />
          <Text style={styles.addText}>Add {selectedTable.label} record</Text>
        </TouchableOpacity>
      )}

      {/* Records list */}
      <FlatList
        data={records}
        keyExtractor={(item, index) => item[selectedTable.idField] ?? String(index)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 12 }} /> : null}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome name="database" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        }
      />

      {/* Edit/Create modal */}
      <AdminEditModal
        visible={modalVisible}
        tableName={selectedTable.label}
        columns={selectedTable.columns}
        record={editRecord}
        isNew={isNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={closeModal}
        saving={saving}
        canDelete={selectedTable.canDelete}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchBar: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  filterScroll: {
    flexShrink: 0,
    flexGrow: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButton: { flexShrink: 0, paddingVertical: 8, paddingHorizontal: 16 },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  addText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  list: { padding: 12, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  cardLabel: { fontSize: 12, color: '#64748B', fontWeight: '500', flex: 1 },
  cardValue: { fontSize: 13, color: '#1E293B', flex: 2, textAlign: 'right' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  editHint: { fontSize: 11, color: '#CBD5E1', marginTop: 4, fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#94A3B8', marginTop: 12 },
});
