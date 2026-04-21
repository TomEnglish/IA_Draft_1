import { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useReceivingStore } from '@/stores/receivingStore';
import { supabase } from '@/lib/supabase';
import type { Location } from '@/types/database';
import { colors } from '@/lib/design/tokens';

interface Props {
  onNext?: () => void;
  onSubmit?: () => void;
  onBack: () => void;
  submitting?: boolean;
}

export function LocationStep({ onNext, onSubmit, onBack, submitting }: Props) {
  const { location, setLocation } = useReceivingStore();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState(location.location_id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const { data, error: err } = await supabase
      .from('locations')
      .select('*')
      .order('zone')
      .order('row')
      .order('rack');

    if (err) {
      setError('Failed to load locations');
    } else {
      setLocations(data as Location[]);
    }
    setLoading(false);
  };

  const handleNext = () => {
    if (!selected) {
      setError('Please select a location');
      return;
    }
    setLocation({ location_id: selected });
    if (onNext) onNext();
    else if (onSubmit) onSubmit();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>Loading locations...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Storage Location</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {locations.length === 0 ? (
        <Text style={styles.hint}>
          No locations configured. Ask an office admin to add yard locations.
        </Text>
      ) : (
        locations.map((loc) => (
          <TouchableOpacity
            key={loc.id}
            style={[styles.locationCard, selected === loc.id && styles.locationSelected]}
            onPress={() => {
              setSelected(loc.id);
              setError('');
            }}
          >
            <Text style={[styles.locationText, selected === loc.id && styles.locationTextSelected]}>
              {loc.zone} - Row {loc.row}, Rack {loc.rack}
            </Text>
            {loc.is_hold_area && <Text style={styles.holdBadge}>HOLD AREA</Text>}
          </TouchableOpacity>
        ))
      )}

      <Button title={submitting ? 'Submitting...' : (onSubmit ? 'Submit' : 'Next')} onPress={handleNext} loading={submitting} style={{ marginTop: 16 }} />
      <Button title="Back" variant="secondary" onPress={onBack} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 },
  error: { color: colors.danger, fontSize: 14, marginBottom: 8 },
  hint: { fontSize: 14, color: colors.textSubtle, textAlign: 'center' },
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimarySoft,
  },
  locationText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  locationTextSelected: {
    color: colors.brandPrimary,
  },
  holdBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
