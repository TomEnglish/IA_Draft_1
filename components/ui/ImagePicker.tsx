import { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ExpoImagePicker from 'expo-image-picker';
import { colors, radius, space, fontSize, fontWeight, touchTarget } from '@/lib/design/tokens';

export type ImagePickerSource = 'camera' | 'library' | 'both';

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  mimeType?: string;
  fileSize?: number;
}

interface ImagePickerProps {
  /** Single picked image, or null if none. */
  value: PickedImage | null;
  onChange: (image: PickedImage | null) => void;
  /**
   * Which sources to offer:
   *   'camera'  — camera only (tap → launches camera)
   *   'library' — library only (tap → opens gallery)
   *   'both'    — Action sheet prompts "Camera" or "Photo library"
   * Default: 'both'.
   */
  source?: ImagePickerSource;
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /**
   * Resize long edge to this many pixels before upload. Skips if the image is
   * already smaller. Default: 2048 (safe for most industrial documentation).
   */
  maxDimension?: number;
  /** JPEG quality (0-1). Default 0.8. */
  quality?: number;
  style?: ViewStyle;
}

/**
 * ImagePicker — single-image picker wrapping `expo-image-picker`.
 *
 * Field workflow: tap → pick / capture → preview with "Replace" + "Remove".
 * Handles permission prompts; if the user denies, surfaces a one-line error
 * that the parent form can render.
 *
 * For industrial inspection workflows (damage photos, PO paperwork,
 * receiving evidence) default the source to 'both' so the user can pick
 * camera on-site and library in the office.
 *
 * For multi-image, compose this inside a parent that holds a PickedImage[]
 * and renders N pickers + an Add button.
 */
export function ImagePicker({
  value,
  onChange,
  source = 'both',
  label,
  helper,
  error,
  required = false,
  disabled = false,
  maxDimension = 2048,
  quality = 0.8,
  style,
}: ImagePickerProps) {
  const [busy, setBusy] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const pickFromCamera = async () => {
    setPermissionError(null);
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setPermissionError('Camera permission required.');
      return;
    }
    setBusy(true);
    try {
      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        quality,
        allowsEditing: false,
      });
      handleResult(result);
    } finally {
      setBusy(false);
    }
  };

  const pickFromLibrary = async () => {
    setPermissionError(null);
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setPermissionError('Photo library permission required.');
      return;
    }
    setBusy(true);
    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        quality,
        allowsEditing: false,
      });
      handleResult(result);
    } finally {
      setBusy(false);
    }
  };

  const handleResult = (result: ExpoImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets[0]) return;
    const a = result.assets[0];
    onChange({
      uri: a.uri,
      width: a.width ?? 0,
      height: a.height ?? 0,
      mimeType: a.mimeType,
      fileSize: a.fileSize,
    });
  };

  const openPicker = () => {
    if (disabled) return;
    if (source === 'camera') return pickFromCamera();
    if (source === 'library') return pickFromLibrary();

    // Both — use the platform's native action sheet pattern.
    Alert.alert(
      label ?? 'Add photo',
      'Choose a source',
      [
        { text: 'Camera', onPress: pickFromCamera },
        { text: 'Photo library', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const remove = () => {
    onChange(null);
    setPermissionError(null);
  };

  const effectiveError = error ?? permissionError ?? undefined;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      {value ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: value.uri }} style={styles.preview} resizeMode="cover" accessibilityLabel="Selected image preview" />
          <View style={styles.previewActions}>
            <Pressable
              onPress={openPicker}
              disabled={disabled || busy}
              accessibilityRole="button"
              accessibilityLabel="Replace image"
              style={({ pressed }) => [
                styles.previewBtn,
                pressed && styles.previewBtnPressed,
                disabled && styles.previewBtnDisabled,
              ]}
            >
              <FontAwesome name="refresh" size={13} color={colors.textPrimary} />
              <Text style={styles.previewBtnText}>Replace</Text>
            </Pressable>
            <Pressable
              onPress={remove}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="Remove image"
              style={({ pressed }) => [
                styles.previewBtn,
                styles.previewBtnDanger,
                pressed && styles.previewBtnDangerPressed,
                disabled && styles.previewBtnDisabled,
              ]}
            >
              <FontAwesome name="trash" size={13} color={colors.danger} />
              <Text style={[styles.previewBtnText, { color: colors.danger }]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={openPicker}
          disabled={disabled || busy}
          accessibilityRole="button"
          accessibilityLabel={label ?? 'Add photo'}
          accessibilityState={{ disabled: disabled || busy }}
          style={({ pressed }) => [
            styles.dropzone,
            Boolean(effectiveError) && styles.dropzoneError,
            pressed && styles.dropzonePressed,
            disabled && styles.dropzoneDisabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.brandPrimary} />
          ) : (
            <>
              <FontAwesome
                name={source === 'camera' ? 'camera' : 'image'}
                size={22}
                color={colors.textMuted}
              />
              <Text style={styles.dropzoneTitle}>
                {source === 'camera' ? 'Take photo' : source === 'library' ? 'Choose from library' : 'Add photo'}
              </Text>
              {source === 'both' ? (
                <Text style={styles.dropzoneCaption}>Camera or library</Text>
              ) : null}
            </>
          )}
        </Pressable>
      )}

      {effectiveError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {effectiveError}
        </Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: space[1] + 2, marginBottom: space[4] },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.textPrimary,
  } as TextStyle,
  required: {
    color: colors.danger,
    fontWeight: fontWeight.bold as TextStyle['fontWeight'],
  },

  // Empty (dropzone)
  dropzone: {
    minHeight: 140,
    borderWidth: 1,
    borderStyle: Platform.OS === 'web' ? 'dashed' : 'solid', // RN doesn't support dashed on iOS <17
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.raised,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[4],
    gap: 8,
  },
  dropzonePressed: { backgroundColor: colors.border },
  dropzoneError: { borderColor: colors.danger },
  dropzoneDisabled: { opacity: 0.5 },
  dropzoneTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.textPrimary,
  } as TextStyle,
  dropzoneCaption: { fontSize: fontSize.sm, color: colors.textMuted },

  // Preview
  previewWrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.raised,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 1,
    backgroundColor: colors.border,
    padding: 1,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: touchTarget,
    paddingVertical: space[2] + 2,
    backgroundColor: colors.surface,
  },
  previewBtnPressed: { backgroundColor: colors.raised },
  previewBtnDanger: {},
  previewBtnDangerPressed: { backgroundColor: colors.dangerSoft },
  previewBtnDisabled: { opacity: 0.5 },
  previewBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.textPrimary,
  } as TextStyle,

  helper: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  error: { fontSize: fontSize.sm, color: colors.danger, marginTop: 2 },
});
