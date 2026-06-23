import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabIcon = ({ focused, icon, label }: { focused: boolean; icon: string; label: string }) => (
  <View style={{ alignItems: 'center', gap: 2 }}>
    <Text style={{ fontSize: 20 }}>{icon}</Text>
    <Text style={{ fontSize: 10, color: focused ? COLORS.primary : COLORS.textMuted, fontWeight: focused ? '700' : '400' }}>
      {label}
    </Text>
  </View>
);

export default function TabsLayout() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🏠" label="Home" />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🎫" label="Tickets" />,
        }}
      />
      <Tabs.Screen
        name="predictions"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🎯" label="Predict" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="👤" label="Profile" />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⚙️" label="Admin" />,
          href: isAdmin ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="superadmin"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="👑" label="Super" />,
          href: isSuperAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
