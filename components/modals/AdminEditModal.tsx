import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/lib/design/tokens';

export interface ColumnConfig {
  key: string;
  label: string;
  editable: boolean;
  type: 'text' | 'number' | 'boolean' | 'enum' | 'date';
  options?: string[];
}

interface AdminEditModalProps {
  visible: boolean;
  tableName: string;
  columns: ColumnConfig[];
  record: Record<string, any> | null;
  isNew: boolean;
  onSave: (changes: Record<string, any>) => void;
  onDelete?: () => void;
  onCancel: () => void;
  saving: boolean;
  canDelete: boolean;
}

export function AdminEditModal({
  visible,
  tableName,
  columns,
  record,
  isNew,
  onSave,
  onDelete,
  onCancel,
  saving,
  canDelete,
}: AdminEditModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    } else if (isNew) {
      const blank: Record<string, any> = {};
      columns.forEach((col) => {
        if (col.type === 'boolean') blank[col.key] = false;
        else if (col.type === 'number') blank[col.key] = '';
        else blank[col.key] = '';
      });
      setFormData(blank);
    }
  }, [record, isNew]);

  const setValue = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const changes: Record<string, any> = {};
    columns.forEach((col) => {
      if (!col.editable && !isNew) return;
      const val = formData[col.key];
      if (col.type === 'number') {
        changes[col.key] = val === '' || val === null || val === undefined ? null : Number(val);
      } else if (col.type === 'boolean') {
        changes[col.key] = !!val;
      } else {
        changes[col.key] = val === '' ? null : val;
      }
    });
    onSave(changes);
  };

  const renderField = (col: ColumnConfig) => {
    const value = formData[col.key];
    const disabled = !col.editable && !isNew;

    if (col.type === 'enum' && col.options) {
      return (
        <View key={col.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{col.label}</Text>
          <View style={styles.enumRow}>
            {col.options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.enumButton,
                  value === opt && styles.enumButtonActive,
                  disabled && styles.enumButtonDisabled,
                ]}
                onPress={() => !disabled && setValue(col.key, opt)}
                disabled={disabled}
              >
                <Text
                  style={[
                    styles.enumText,
                    value === opt && styles.enumTextActive,
                  ]}
                >
                  {opt.replaceAll('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (col.type === 'boolean') {
      return (
        <View key={col.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{col.label}</Text>
          <View style={styles.enumRow}>
            <TouchableOpacity
              style={[styles.enumButton, value === true && styles.enumButtonActive, disabled && styles.enumButtonDisabled]}
              onPress={() => !disabled && setValue(col.key, true)}
              disabled={disabled}
            >
              <Text style={[styles.enumText, value === true && styles.enumTextActive]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.enumButton, value === false && styles.enumButtonActive, disabled && styles.enumButtonDisabled]}
              onPress={() => !disabled && setValue(col.key, false)}
              disabled={disabled}
            >
              <Text style={[styles.enumText, value === false && styles.enumTextActive]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <Input
        key={col.key}
        label={col.label}
        value={value != null ? String(value) : ''}
        onChangeText={(text) => setValue(col.key, text)}
        editable={!disabled}
        keyboardType={col.type === 'number' ? 'numeric' : 'default'}
      />
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isNew ? `New ${tableName}` : `Edit ${tableName}`}
          </Text>
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {columns.map(renderField)}
          </ScrollView>
          <Button title={isNew ? 'Create' : 'Save'} onPress={handleSave} loading={saving} />
          {canDelete && !isNew && onDelete && (
            <Button
              title="Delete"
              variant="danger"
              onPress={onDelete}
              style={{ marginTop: 8 }}
            />
          )}
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  scrollArea: {
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  enumRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  enumButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  enumButtonActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  enumButtonDisabled: {
    opacity: 0.5,
  },
  enumText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  enumTextActive: {
    color: colors.textInverse,
  },
});
