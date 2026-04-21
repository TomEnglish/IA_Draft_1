import { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  FlatList,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Modal } from './Modal';
import { colors, radius, space, fontSize, fontWeight, touchTarget } from '@/lib/design/tokens';

interface SelectOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T extends string | number> {
  label: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Select — a labeled dropdown. Tap opens a Modal with the option list;
 * selecting an option closes the sheet. Matches the HTML <select>
 * pattern from prototype.html.
 */
export function Select<T extends string | number>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  helper,
  error,
  required = false,
  disabled = false,
  style,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

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
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        accessibilityState={{ disabled, expanded: open }}
        style={({ pressed }) => [
          styles.trigger,
          Boolean(error) && styles.triggerError,
          disabled && styles.triggerDisabled,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
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
        onClose={() => setOpen(false)}
        title={label}
      >
        <FlatList
          data={options}
          keyExtractor={(item) => String(item.value)}
          renderItem={({ item }) => {
            const isActive = item.value === value;
            return (
              <Pressable
                onPress={() => {
                  if (!item.disabled) {
                    onChange(item.value);
                    setOpen(false);
                  }
                }}
                disabled={item.disabled}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isActive, disabled: !!item.disabled }}
                style={({ pressed }) => [
                  styles.option,
                  isActive && styles.optionActive,
                  pressed && !item.disabled && styles.optionPressed,
                  item.disabled && styles.optionDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isActive && styles.optionTextActive,
                    item.disabled && styles.optionTextDisabled,
                  ]}
                >
                  {item.label}
                </Text>
                {isActive ? (
                  <FontAwesome name="check" size={14} color={colors.brandPrimary} />
                ) : null}
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    minHeight: touchTarget,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.md,
  },
  optionActive: { backgroundColor: colors.brandPrimarySoft },
  optionPressed: { backgroundColor: colors.raised },
  optionDisabled: { opacity: 0.5 },
  optionText: { fontSize: fontSize.md, color: colors.textPrimary } as TextStyle,
  optionTextActive: {
    color: colors.brandPrimary,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
  },
  optionTextDisabled: { color: colors.textSubtle },
  separator: { height: 1, backgroundColor: colors.raised },
});
