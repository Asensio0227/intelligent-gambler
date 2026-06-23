import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { COLORS } from '@/constants/colors';

const NAV_CARDS = [
  { icon: '👥', label: 'Users', route: '/(admin)/users' },
  { icon: '🎯', label: 'Predictions', route: '/(admin)/predictions' },
  { icon: '🎫', label: 'All Tickets', route: '/(admin)/tickets' },
  { icon: '🔄', label: 'Fixtures', route: '/(admin)/fixtures' },
  { icon: '📊', label: 'Dashboard', route: '/(admin)/' },
];

export default function AdminHubScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)');
    }
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage your platform</Text>
        </View>
        {user && <RoleBadge role={user.role} />}
      </View>

      <View style={styles.grid}>
        {NAV_CARDS.map((card) => (
          <TouchableOpacity
            key={card.label}
            onPress={() => router.push(card.route as never)}
            style={styles.card}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>{card.icon}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIcon: { fontSize: 32 },
  cardLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
