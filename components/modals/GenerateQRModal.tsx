import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { space } from '@/lib/design/tokens';

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
    <Modal
      visible={visible}
      onClose={onCancel}
      title="Generate QR Codes"
      actions={
        <>
          <Button title="Cancel" variant="ghost" onPress={onCancel} />
          <Button title="Generate" onPress={onGenerate} loading={generating} />
        </>
      }
    >
      <View style={{ gap: space[2] }}>
        <Input
          label="How many?"
          value={batchCount}
          onChangeText={setBatchCount}
          placeholder="1-100"
          keyboardType="number-pad"
          helper="Batch size must be between 1 and 100."
        />
      </View>
    </Modal>
  );
}
