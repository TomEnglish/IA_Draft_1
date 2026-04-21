import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { colors, radius, space, fontSize, fontWeight } from '@/lib/design/tokens';

export type ToastTone = 'success' | 'info' | 'warn' | 'danger';

type FAIcon = ComponentProps<typeof FontAwesome>['name'];

interface ToastProps {
  visible: boolean;
  tone?: ToastTone;
  title: string;
  message?: string;
  /**
   * Dismiss callback. Passing this also renders the × button. Omit to make
   * the toast stay on screen until the caller unmounts it.
   */
  onDismiss?: () => void;
  /**
   * Auto-dismiss after N ms. Requires `onDismiss` to be set. Default: no auto.
   */
  autoDismissMs?: number;
  style?: ViewStyle;
}

// React Native's AccessibilityRole does not include "status" — that is
// web-only. Success/info toasts are announced via accessibilityLiveRegion
// only (polite); warn/danger use role="alert" + assertive live region so
// screen readers interrupt.
const PALETTE: Record<
  ToastTone,
  { bg: string; fg: string; icon: FAIcon; assertive: boolean }
> = {
  success: { bg: colors.successSoft,     fg: colors.success,      icon: 'check-circle',          assertive: false },
  info:    { bg: colors.brandPrimarySoft, fg: colors.brandPrimary, icon: 'info-circle',          assertive: false },
  warn:    { bg: colors.warnSoft,         fg: colors.warn,         icon: 'exclamation-triangle', assertive: true  },
  danger:  { bg: colors.dangerSoft,       fg: colors.danger,       icon: 'times-circle',          assertive: true  },
};

/**
 * Toast / banner. Four tones. Status tones (success, info) use
 * accessibilityRole="status" (polite); alert tones (warn, danger) use
 * role="alert" (assertive) so screen readers interrupt.
 *
 * For a stack of multiple toasts, wrap several of these in a View — this
 * component renders a single banner only.
 */
export function Toast({
  visible,
  tone = 'info',
  title,
  message,
  onDismiss,
  autoDismissMs,
  style,
}: ToastProps) {
  const p = PALETTE[tone];

  useEffect(() => {
    if (!visible || !autoDismissMs || !onDismiss) return;
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [visible, autoDismissMs, onDismiss]);

  if (!visible) return null;

  return (
    <View
      style={[styles.toast, { backgroundColor: p.bg, borderColor: p.fg }, style]}
      accessibilityRole={p.assertive ? 'alert' : undefined}
      accessibilityLiveRegion={p.assertive ? 'assertive' : 'polite'}
    >
      <FontAwesome name={p.icon} size={18} color={p.fg} style={styles.icon} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: p.fg }]}>{title}</Text>
        {message ? <Text style={[styles.msg, { color: p.fg }]}>{message}</Text> : null}
      </View>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={({ pressed }) => [styles.close, pressed && { opacity: 0.5 }]}
          hitSlop={8}
        >
          <FontAwesome name="times" size={14} color={p.fg} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  icon: { marginTop: 1 },
  body: { flex: 1, gap: 2 },
  title: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
  } as TextStyle,
  msg: { fontSize: fontSize.body, opacity: 0.85 } as TextStyle,
  close: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
});
