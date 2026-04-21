import { Pressable, View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors, space, fontSize, fontWeight, touchTarget } from '@/lib/design/tokens';

/**
 * Radio button (single). Most callers should use <RadioGroup> below — this is
 * exported for advanced cases where the options aren't in a flat list.
 */
interface RadioProps {
  selected: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function Radio({ selected, onPress, label, disabled = false, accessibilityLabel, style }: RadioProps) {
  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.row, disabled && styles.rowDisabled, pressed && styles.rowPressed, style]}
    >
      <View
        style={[
          styles.circle,
          selected && styles.circleSelected,
          disabled && styles.circleDisabled,
        ]}
      >
        {selected ? <View style={styles.dot} /> : null}
      </View>
      {label ? <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text> : null}
    </Pressable>
  );
}

/**
 * RadioGroup — give it a `value` + `options` array and it renders a vertical
 * stack of radios. All options share the same name (logical group) and only
 * one can be selected. `T` is the option value type — keep it to primitives.
 */
interface RadioGroupOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps<T> {
  value: T | undefined;
  onChange: (value: T) => void;
  options: RadioGroupOption<T>[];
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function RadioGroup<T extends string | number>({
  value,
  onChange,
  options,
  accessibilityLabel,
  style,
}: RadioGroupProps<T>) {
  return (
    <View style={style} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((opt) => (
        <Radio
          key={String(opt.value)}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
          label={opt.label}
          disabled={opt.disabled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2] + 2,
    minHeight: touchTarget,
    paddingVertical: space[1] + 2,
  },
  rowPressed: { opacity: 0.85 },
  rowDisabled: { opacity: 0.5 },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: { borderColor: colors.brandPrimary },
  circleDisabled: { backgroundColor: colors.raised },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandPrimary,
  },
  label: { fontSize: fontSize.body, color: colors.textPrimary, fontWeight: fontWeight.regular as TextStyle['fontWeight'] } as TextStyle,
  labelDisabled: { color: colors.textSubtle },
});
