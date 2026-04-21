import { useState, useEffect } from 'react';
import {
  Pressable,
  View,
  Text,
  ScrollView,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Modal } from './Modal';
import { colors, radius, space, fontSize, fontWeight, touchTarget } from '@/lib/design/tokens';

interface MultiSelectOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps<T extends string | number> {
  label: string;
  values: T[];
  onChange: (values: T[]) => void;
  options: MultiSelectOption<T>[];
  placeholder?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Max items to show in the trigger before collapsing to "+N more". Default 2. */
  maxDisplay?: number;
  /** Show "Select all" / "Clear" actions in the sheet header. Default true. */
  showBulkActions?: boolean;
  style?: ViewStyle;
}

/**
 * MultiSelect — like Select, but the sheet stays open and users check
 * multiple options, then tap Apply. Draft selections don't commit until
 * Apply, so tapping Cancel (or the backdrop) reverts.
 *
 * For filter bars where every tap should commit immediately, use a chip
 * bar (`<DataTable filters={...}>`) instead — MultiSelect is for forms
 * where the user assembles a set before submitting.
 */
export function MultiSelect<T extends string | number>({
  label,
  values,
  onChange,
  options,
  placeholder = 'Select…',
  helper,
  error,
  required = false,
  disabled = false,
  maxDisplay = 2,
  showBulkActions = true,
  style,
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  // Draft state — only commits on Apply.
  const [draft, setDraft] = useState<T[]>(values);

  useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  const toggle = (v: T) => {
    setDraft((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const selectAll = () => setDraft(options.filter((o) => !o.disabled).map((o) => o.value));
  const clearAll = () => setDraft([]);

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };

  const cancel = () => {
    setDraft(values);
    setOpen(false);
  };

  const selectedLabels = values
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean) as string[];
  const triggerText =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= maxDisplay
      ? selectedLabels.join(', ')
      : `${selectedLabels.slice(0, maxDisplay).join(', ')} · +${
          selectedLabels.length - maxDisplay
        } more`;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityValue={{ text: triggerText }}
        accessibilityState={{ disabled, expanded: open }}
        style={({ pressed }) => [
          styles.trigger,
          Boolean(error) && styles.triggerError,
          disabled && styles.triggerDisabled,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text
          style={[styles.value, selectedLabels.length === 0 && styles.placeholder]}
          numberOfLines={1}
        >
          {triggerText}
        </Text>
        <FontAwesome name="chevron-down" size={12} color={colors.textMuted} />
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}

      <Modal
        visible={open}
        onClose={cancel}
        title={label}
        actions={
          <>
            <Button title="Cancel" variant="ghost" onPress={cancel} />
            <Button title="Apply" onPress={apply} />
          </>
        }
      >
        {showBulkActions ? (
          <View style={styles.bulkRow}>
            <Pressable
              onPress={selectAll}
              accessibilityRole="button"
              accessibilityLabel="Select all"
              hitSlop={8}
            >
              <Text style={styles.bulkAction}>Select all</Text>
            </Pressable>
            <Text style={styles.bulkSep}>·</Text>
            <Pressable
              onPress={clearAll}
              accessibilityRole="button"
              accessibilityLabel="Clear selection"
              hitSlop={8}
            >
              <Text style={styles.bulkAction}>Clear</Text>
            </Pressable>
            <Text style={styles.bulkCount}>
              {draft.length} of {options.length} selected
            </Text>
          </View>
        ) : null}
        <ScrollView style={{ maxHeight: 380 }}>
          {options.map((opt) => (
            <Checkbox
              key={String(opt.value)}
              checked={draft.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              label={opt.label}
              disabled={opt.disabled}
            />
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space[1] + 2, marginBottom: space[4] },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.textPrimary,
  },
  required: { color: colors.danger, fontWeight: fontWeight.bold as TextStyle['fontWeight'] },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
    minHeight: touchTarget,
    paddingHorizontal: space[3],
    paddingVertical: space[2] + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  triggerPressed: { borderColor: colors.borderStrong },
  triggerError: { borderColor: colors.danger },
  triggerDisabled: { opacity: 0.55, backgroundColor: colors.raised },
  value: { flex: 1, fontSize: fontSize.md, color: colors.textPrimary } as TextStyle,
  placeholder: { color: colors.textSubtle },
  helper: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  error: { fontSize: fontSize.sm, color: colors.danger, marginTop: 2 },
  bulkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingBottom: space[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: space[2],
  },
  bulkAction: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.brandPrimary,
  } as TextStyle,
  bulkSep: { fontSize: fontSize.sm, color: colors.textSubtle },
  bulkCount: {
    marginLeft: 'auto',
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
