import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useNetworkStore } from '@/lib/sync/networkStore';
import { getQueueStats } from '@/lib/sync/offlineQueue';

export function OfflineIndicator() {
  const isOnline = useNetworkStore((s) => s.isOnline);
  const [stats, setStats] = useState({ pending: 0, deadLetters: 0 });

  useFocusEffect(
    useCallback(() => {
      getQueueStats().then(setStats);
    }, [isOnline])
  );

  if (isOnline && stats.deadLetters === 0 && stats.pending === 0) return null;

  return (
    <View>
      {!isOnline && (
        <View style={styles.banner}>
          <Text style={styles.text}>
            You are offline — {stats.pending > 0 ? `${stats.pending} pending` : 'changes will sync when reconnected'}
          </Text>
        </View>
      )}
      {isOnline && stats.pending > 0 && (
        <View style={styles.pendingBanner}>
          <Text style={styles.text}>
            {stats.pending} queued action{stats.pending > 1 ? 's' : ''} syncing...
          </Text>
        </View>
      )}
      {stats.deadLetters > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.text}>
            {stats.deadLetters} queued action{stats.deadLetters > 1 ? 's' : ''} failed after multiple retries
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  pendingBanner: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
