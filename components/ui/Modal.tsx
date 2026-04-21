import { Modal as RNModal, View, Text, Pressable, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors, radius, space, fontSize, fontWeight, shadow } from '@/lib/design/tokens';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /**
   * Action row rendered in the bottom-right of the dialog. Pass buttons.
   */
  actions?: ReactNode;
  /**
   * Maximum width of the dialog (px). Default 440.
   */
  maxWidth?: number;
  /**
   * When true, clicking the backdrop closes the modal. Default true.
   * Set false for destructive confirmations where an accidental dismiss is costly.
   */
  dismissOnBackdrop?: boolean;
  /**
   * a11y label for the dialog. If `title` is set this is optional.
   */
  accessibilityLabel?: string;
}

/**
 * Modal — native <Modal> with a tokenized backdrop + card. Closes on Escape
 * (hardware back on Android, keyboard on web). Consumers should provide an
 * `onClose` that unmounts the trigger. Focus is retained on the dialog by
 * the native Modal implementation on iOS/Android; on web, the dialog gets
 * keyboard-focus via the outermost Pressable.
 */
export function Modal({
  visible,
  onClose,
  title,
  children,
  actions,
  maxWidth = 440,
  dismissOnBackdrop = true,
  accessibilityLabel,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable
        style={styles.backdrop}
        onPress={dismissOnBackdrop ? onClose : undefined}
        accessibilityLabel={dismissOnBackdrop ? 'Close dialog' : undefined}
      >
        <View
          style={[styles.dialog, { maxWidth }]}
          onStartShouldSetResponder={() => true}
          accessibilityRole="alert"
          accessibilityLabel={accessibilityLabel ?? title}
        >
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <View style={styles.body}>{children}</View>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[6],
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[6],
    gap: space[4],
    ...shadow.lg,
  } as ViewStyle,
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as TextStyle['fontWeight'],
    color: colors.textPrimary,
  },
  body: { gap: space[2] },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: space[2],
    paddingTop: space[1],
  },
});
