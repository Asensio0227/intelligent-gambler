import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { COLORS } from '@/constants/colors';

const SUPERADMIN_CARDS = [
  { icon: '👑', label: 'Admins', route: '/(superadmin)/admins', color: '#7c3aed' },
  { icon: '📈', label: 'Usage & Costs', route: '/(superadmin)/usage', color: COLORS.warning },
  { icon: '⚙️', label: 'System Config', route: '/(superadmin)/system', color: '#0ea5e9' },
  { icon: '🏠', label: 'SA Dashboard', route: '/(superadmin)/', color: COLORS.success },
];

const ADMIN_CARDS = [
  { icon: '👥', label: 'Users', route: '/(admin)/users' },
  { icon: '🎯', label: 'Predictions', route: '/(admin)/predictions' },
  { icon: '🎫', label: 'All Tickets', route: '/(admin)/tickets' },
  { icon: '🔄', label: 'Fixtures', route: '/(admin)/fixtures' },
];

export default function SuperadminHubScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace('/(tabs)');
    }
  }, [isSuperAdmin]);

  if (!isSuperAdmin) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Superadmin Panel</Text>
            <Text style={styles.subtitle}>Full system control</Text>
          </View>
          {user && <RoleBadge role={user.role} />}
        </View>

        <Text style={styles.sectionLabel}>Superadmin</Text>
        <View style={styles.grid}>
          {SUPERADMIN_CARDS.map((card) => (
            <TouchableOpacity
              key={card.label}
              onPress={() => router.push(card.route as never)}
              style={[styles.card, { borderTopColor: card.color, borderTopWidth: 3 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Admin Tools</Text>
        <View style={styles.grid}>
          {ADMIN_CARDS.map((card) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
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
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
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
  cardIcon: { fontSize: 30 },
  cardLabel: { color: COLORS.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
