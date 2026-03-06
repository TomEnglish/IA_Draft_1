import { Button } from '@/components/ui/Button';
import type { QRCodeRecord } from '@/lib/api/qrcodes';
import { Modal, StyleSheet, Text, View } from 'react-native';

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
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>QR Code Detail</Text>
                    {code && (
                        <>
                            <DetailRow label="Code" value={code.code_value} />
                            <DetailRow label="Status" value={code.entity_id ? 'Linked' : 'Available'} />
                            <DetailRow label="Created" value={new Date(code.created_at).toLocaleDateString()} />
                            {material && (
                                <>
                                    <Text style={styles.sectionLabel}>Linked Material</Text>
                                    <DetailRow label="Type" value={material.material_type} />
                                    <DetailRow label="Status" value={material.status} />
                                    <DetailRow label="Qty" value={`${material.current_quantity} / ${material.qty}`} />
                                </>
                            )}
                            <Button
                                title="Print This Label"
                                variant="secondary"
                                onPress={() => onPrint([code])}
                                style={{ marginTop: 12 }}
                            />
                        </>
                    )}
                    <Button
                        title="Close"
                        variant="secondary"
                        onPress={onClose}
                        style={{ marginTop: 8 }}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginTop: 12,
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    detailLabel: { fontSize: 13, color: '#64748B' },
    detailValue: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
});
