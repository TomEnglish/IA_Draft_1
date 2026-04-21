import { Switch as RNSwitch, View, Text, Platform, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors, space, fontSize } from '@/lib/design/tokens';

interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function Switch({
  value,
  onChange,
  label,
  disabled = false,
  accessibilityLabel,
  style,
}: SwitchProps) {
  const control = (
    <RNSwitch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }}
      thumbColor={Platform.OS === 'ios' ? colors.surface : colors.textInverse}
      ios_backgroundColor={colors.borderStrong}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    />
  );

  if (!label) return <View style={style}>{control}</View>;

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      {control}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[4],
    paddingVertical: space[1] + 2,
    minHeight: 44,
  },
  label: { fontSize: fontSize.body, color: colors.textPrimary, flex: 1 } as TextStyle,
  labelDisabled: { color: colors.textSubtle },
});
