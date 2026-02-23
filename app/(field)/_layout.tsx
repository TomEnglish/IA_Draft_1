import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, router } from 'expo-router';
import { SignOutButton } from '@/components/ui/SignOutButton';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { useAuthStore } from '@/stores/authStore';

export default function FieldLayout() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else if (user.role === 'office_staff') {
      router.replace('/(office)/dashboard');
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <OfflineIndicator />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#94A3B8',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontWeight: '600' },
          headerRight: () => <SignOutButton />,
        }}
      >
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="qrcode" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{
            title: 'Inventory',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="cubes" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="history" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="receiving"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="material-detail"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
