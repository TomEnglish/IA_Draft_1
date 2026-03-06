import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, StyleSheet, Text, View } from 'react-native';

interface GenerateQRModalProps {
    visible: boolean;
    batchCount: string;
    setBatchCount: (val: string) => void;
    generating: boolean;
    onGenerate: () => void;
    onCancel: () => void;
}

export function GenerateQRModal({
    visible,
    batchCount,
    setBatchCount,
    generating,
    onGenerate,
    onCancel,
}: GenerateQRModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Generate QR Codes</Text>
                    <Input
                        label="How many?"
                        value={batchCount}
                        onChangeText={setBatchCount}
                        placeholder="1-100"
                    />
                    <Button title="Generate" onPress={onGenerate} loading={generating} />
                    <Button
                        title="Cancel"
                        variant="secondary"
                        onPress={onCancel}
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
});
