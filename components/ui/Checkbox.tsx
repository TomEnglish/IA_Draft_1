import { Pressable, View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, radius, space, fontSize, touchTarget } from '@/lib/design/tokens';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  accessibilityLabel,
  style,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.row, disabled && styles.rowDisabled, pressed && styles.rowPressed, style]}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          disabled && styles.boxDisabled,
        ]}
      >
        {checked ? (
          <FontAwesome name="check" size={12} color={colors.textInverse} />
        ) : null}
      </View>
      {label ? <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text> : null}
    </Pressable>
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
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  boxDisabled: { backgroundColor: colors.raised },
  label: { fontSize: fontSize.body, color: colors.textPrimary } as TextStyle,
  labelDisabled: { color: colors.textSubtle },
});
