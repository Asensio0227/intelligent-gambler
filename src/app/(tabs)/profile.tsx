import { Avatar } from '@/components/shared/Avatar';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro ⭐',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showLogout, setShowLogout] = useState(false);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar & Name */}
        <View style={styles.profileSection}>
          <Avatar name={`${user.name} ${user.lastName}`} size={72} />
          <Text style={styles.name}>
            {user.name} {user.lastName}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          <RoleBadge role={user.role} />
        </View>

        {/* Billing */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Billing</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Plan</Text>
            <Text style={styles.rowValue}>
              {user.billing
                ? (PLAN_LABELS[user.billing.plan] ?? user.billing.plan)
                : '—'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Credits Remaining</Text>
            <Text style={styles.rowValue}>
              {user.billing ? user.billing.creditsRemaining : '—'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Credits Used</Text>
            <Text style={styles.rowValue}>
              {user.billing ? user.billing.creditsUsed : '—'}
            </Text>
          </View>
          <TouchableOpacity disabled style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>
              Upgrade Plan — Coming Soon
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Status</Text>
            <Text
              style={[
                styles.rowValue,
                { color: user.isActive ? COLORS.success : COLORS.danger },
              ]}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Member Since</Text>
            <Text style={styles.rowValue}>
              {new Date(user.createdAt).toLocaleDateString('en-ZW', {
                year: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </View>

        {/* About & Legal */}
        <TouchableOpacity
          onPress={() => router.push('/legal' as never)}
          style={styles.card}
        >
          <View style={styles.row}>
            <Text style={styles.rowLabel}>About & Legal</Text>
            <Text style={[styles.rowValue, { color: COLORS.primary }]}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={() => setShowLogout(true)}
          style={styles.logoutBtn}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={showLogout}
        title='Sign Out'
        message='Are you sure you want to sign out?'
        confirmLabel='Sign Out'
        cancelLabel='Cancel'
        onConfirm={async () => {
          setShowLogout(false);
          await logout();
          router.replace('/(auth)/login');
        }}
        onCancel={() => setShowLogout(false)}
        danger
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  profileSection: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  name: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginTop: 4 },
  email: { color: COLORS.textMuted, fontSize: 14 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: { color: COLORS.textMuted, fontSize: 14 },
  rowValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  upgradeBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
    opacity: 0.5,
    marginTop: 4,
  },
  upgradeBtnText: { color: COLORS.textMuted, fontSize: 13 },
  logoutBtn: {
    backgroundColor: '#450a0a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
});
