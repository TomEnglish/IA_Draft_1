import { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  Platform,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Button } from './Button';
import { Modal } from './Modal';
import { colors, radius, space, fontSize, fontWeight, touchTarget } from '@/lib/design/tokens';

type Mode = 'date' | 'time' | 'datetime';

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  mode?: Mode;
  /** Min selectable date. */
  minimumDate?: Date;
  /** Max selectable date. */
  maximumDate?: Date;
  placeholder?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Format function for the trigger display. Default: locale date string. */
  formatValue?: (d: Date) => string;
  style?: ViewStyle;
}

const defaultFormat = (d: Date, mode: Mode): string => {
  if (mode === 'time') return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (mode === 'datetime') return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * DatePicker — labeled trigger that opens the platform-native date UI.
 *
 * iOS: the native spinner/wheel renders inline in a modal sheet with
 * explicit Cancel/Apply buttons. Selecting doesn't commit until Apply.
 *
 * Android: taps the trigger → native Material date dialog pops. Selecting
 * commits immediately and dismisses the dialog (Android convention).
 *
 * Web: react-native-community/datetimepicker renders an HTML5 input; value
 * changes commit immediately.
 *
 * Use `mode="datetime"` for ship-windows, `"date"` for delivery dates,
 * `"time"` for shift boundaries.
 */
export function DatePicker({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  placeholder = 'Select date…',
  helper,
  error,
  required = false,
  disabled = false,
  formatValue,
  style,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | null>(value);

  const openPicker = () => {
    if (disabled) return;
    setDraft(value ?? new Date());
    setOpen(true);
  };

  const handleNativeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      // Android fires with 'set' on apply, 'dismissed' on cancel.
      if (event.type === 'set' && selected) {
        onChange(selected);
      }
      setOpen(false);
    } else {
      // iOS / web — update draft without dismissing.
      if (selected) setDraft(selected);
    }
  };

  const apply = () => {
    if (draft) onChange(draft);
    setOpen(false);
  };

  const cancel = () => {
    setDraft(value);
    setOpen(false);
  };

  const display = value ? (formatValue ? formatValue(value) : defaultFormat(value, mode)) : placeholder;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.labelText}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: display }}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.trigger,
          Boolean(error) && styles.triggerError,
          disabled && styles.triggerDisabled,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {display}
        </Text>
        <FontAwesome name="calendar" size={14} color={colors.textMuted} />
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode}
          onChange={handleNativeChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {open && Platform.OS !== 'android' ? (
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
          <DateTimePicker
            value={draft ?? new Date()}
            mode={mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleNativeChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={styles.pickerInline}
          />
        </Modal>
      ) : null}
    </View>
  );
}

/**
 * DateRangePicker — two DatePickers wired to a shared range value.
 * Most useful for audit windows, shipment windows, or date-range reports.
 * Validates that `end >= start` and shows an inline error if the user picks
 * a reversed range.
 */
interface DateRangePickerProps {
  label: string;
  startLabel?: string;
  endLabel?: string;
  value: { start: Date | null; end: Date | null };
  onChange: (value: { start: Date | null; end: Date | null }) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  required?: boolean;
  disabled?: boolean;
  helper?: string;
  error?: string;
  style?: ViewStyle;
}

export function DateRangePicker({
  label,
  startLabel = 'Start',
  endLabel = 'End',
  value,
  onChange,
  minimumDate,
  maximumDate,
  required,
  disabled,
  helper,
  error: externalError,
  style,
}: DateRangePickerProps) {
  const rangeInvalid =
    value.start && value.end && value.end.getTime() < value.start.getTime();
  const effectiveError =
    externalError ?? (rangeInvalid ? 'End date must be after start date' : undefined);

  return (
    <View style={style}>
      <Text style={[styles.labelText, { marginBottom: space[2] }]}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <View style={styles.rangeRow}>
        <View style={styles.rangeCol}>
          <DatePicker
            label={startLabel}
            value={value.start}
            onChange={(d) => onChange({ ...value, start: d })}
            minimumDate={minimumDate}
            maximumDate={value.end ?? maximumDate}
            disabled={disabled}
          />
        </View>
        <View style={styles.rangeCol}>
          <DatePicker
            label={endLabel}
            value={value.end}
            onChange={(d) => onChange({ ...value, end: d })}
            minimumDate={value.start ?? minimumDate}
            maximumDate={maximumDate}
            disabled={disabled}
          />
        </View>
      </View>
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

const styles = StyleSheet.create({
  container: { gap: space[1] + 2, marginBottom: space[4] },
  labelText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.textPrimary,
  } as TextStyle,
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
  pickerInline: {
    alignSelf: 'center',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  rangeCol: {
    flex: 1,
  },
});
