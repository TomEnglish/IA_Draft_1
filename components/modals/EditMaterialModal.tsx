import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MaterialWithLocation } from '@/lib/api/materials';
import { Modal, StyleSheet, Text, View } from 'react-native';

interface EditMaterialModalProps {
    editItem: MaterialWithLocation | null;
    editType: string;
    setEditType: (val: string) => void;
    editSize: string;
    setEditSize: (val: string) => void;
    editGrade: string;
    setEditGrade: (val: string) => void;
    editSpec: string;
    setEditSpec: (val: string) => void;
    editWeight: string;
    setEditWeight: (val: string) => void;
    onSave: () => void;
    saving: boolean;
    onCancel: () => void;
}

export function EditMaterialModal({
    editItem,
    editType,
    setEditType,
    editSize,
    setEditSize,
    editGrade,
    setEditGrade,
    editSpec,
    setEditSpec,
    editWeight,
    setEditWeight,
    onSave,
    saving,
    onCancel,
}: EditMaterialModalProps) {
    return (
        <Modal visible={!!editItem} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Material</Text>
                    <Input label="Material Type" value={editType} onChangeText={setEditType} />
                    <Input label="Size" value={editSize} onChangeText={setEditSize} />
                    <Input label="Grade" value={editGrade} onChangeText={setEditGrade} />
                    <Input label="Spec" value={editSpec} onChangeText={setEditSpec} />
                    <Input label="Weight" value={editWeight} onChangeText={setEditWeight} />
                    <Button title="Save" onPress={onSave} loading={saving} />
                    <Button title="Cancel" variant="secondary" onPress={onCancel} style={{ marginTop: 8 }} />
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
