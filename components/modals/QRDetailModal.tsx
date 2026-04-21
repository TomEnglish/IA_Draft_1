import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { QRCodeRecord } from '@/lib/api/qrcodes';
import { colors, space, fontSize, fontWeight } from '@/lib/design/tokens';

interface QRDetailModalProps {
  visible: boolean;
  code: QRCodeRecord | null;
  material: any;
  onPrint: (codes: QRCodeRecord[]) => void;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function QRDetailModal({
  visible,
  code,
  material,
  onPrint,
  onClose,
}: QRDetailModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="QR code detail"
      actions={
        <>
          <Button title="Close" variant="ghost" onPress={onClose} />
          {code ? (
            <Button title="Print label" variant="secondary" onPress={() => onPrint([code])} />
          ) : null}
        </>
      }
    >
      {code ? (
        <View>
          <DetailRow label="Code" value={code.code_value} />
          <DetailRow
            label="Status"
            value={code.entity_id ? 'Linked' : 'Available'}
          />
          <DetailRow
            label="Created"
            value={new Date(code.created_at).toLocaleDateString()}
          />
          {material ? (
            <>
              <Text style={styles.sectionLabel}>Linked material</Text>
              <DetailRow label="Type" value={material.material_type} />
              <DetailRow label="Status" value={material.status} />
              <DetailRow
                label="Qty"
                value={`${material.current_quantity} / ${material.qty}`}
              />
            </>
          ) : null}
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.textPrimary,
    marginTop: space[3],
    marginBottom: space[1],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: space[2] - 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.raised,
  },
  detailLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium as TextStyle['fontWeight'],
  } as TextStyle,
});
