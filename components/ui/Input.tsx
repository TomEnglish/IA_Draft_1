import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, radius, space, fontSize, fontWeight, ring, touchTarget } from '@/lib/design/tokens';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

export function Input({ label, error, helper, required, style, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textSubtle}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: space[4],
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium as TextStyle['fontWeight'],
    color: colors.textPrimary,
    marginBottom: space[2],
  },
  required: {
    color: colors.danger,
    fontWeight: fontWeight.bold as TextStyle['fontWeight'],
  },
  input: {
    minHeight: touchTarget,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[2] + 2,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputFocused: {
    borderColor: ring.color,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'solid',
          outlineColor: ring.color,
          outlineWidth: ring.width,
          outlineOffset: 0,
        } as unknown as ViewStyle)
      : {}),
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
    marginTop: space[1],
  },
  helper: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: space[1],
  },
});
