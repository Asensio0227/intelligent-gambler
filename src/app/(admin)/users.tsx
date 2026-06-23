import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '@/store/adminStore';
import { UserRow } from '@/components/admin/UserRow';
import { Header } from '@/components/shared/Header';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { IUser } from '@/types/auth.types';
import { COLORS } from '@/constants/colors';

export default function AdminUsersScreen() {
  const { users, fetchUsers, updateUser, banUser, unbanUser, suspendUser, isLoading } = useAdminStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<IUser | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendDays, setSuspendDays] = useState('7');
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchUsers(text);
  };

  const handleUpdate = async (updates: Partial<IUser>) => {
    if (!selected) return;
    await updateUser(selected._id, updates);
    setSelected(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Manage Users" showBack />
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search users..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
        />
      </View>
      {isLoading && users.length === 0 && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />}
      <FlashList
          estimatedItemSize={80}
        data={users}
        keyExtractor={(u) => u._id}
        renderItem={({ item }) => (
          <UserRow user={item} onPress={() => setSelected(item)} />
        )}
        ListEmptyComponent={<EmptyState icon="👥" title="No users found" />}
      />

      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet">
        {selected && (
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.userName}>{selected.name} {selected.lastName}</Text>
              <Text style={styles.userEmail}>{selected.email}</Text>

              <Text style={styles.fieldLabel}>Role</Text>
              <View style={styles.roleRow}>
                {(['user', 'admin', 'superadmin'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => handleUpdate({ role })}
                    style={[styles.roleChip, selected.role === role && styles.roleChipActive]}
                  >
                    <Text style={[styles.roleChipText, selected.role === role && { color: '#fff' }]}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Account Status</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusPill, selected.isActive ? styles.statusActive : styles.statusBanned]}>
                  <Text style={styles.statusPillText}>
                    {selected.isActive ? '✅ Active' : '🚫 Banned/Suspended'}
                  </Text>
                </View>
              </View>

              {selected.isActive ? (
                <>
                  <TouchableOpacity
                    onPress={() => setShowSuspendModal(true)}
                    style={styles.suspendBtn}
                  >
                    <Text style={styles.suspendBtnText}>⏸ Suspend Temporarily</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => { await banUser(selected._id); setSelected(null); }}
                    style={styles.banBtn}
                  >
                    <Text style={styles.banBtnText}>🚫 Ban Permanently</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={async () => { await unbanUser(selected._id); setSelected(null); }}
                  style={styles.unbanBtn}
                >
                  <Text style={styles.unbanBtnText}>✅ Restore Account</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal visible={showSuspendModal} animationType="fade" transparent>
        <View style={styles.suspendOverlay}>
          <View style={styles.suspendCard}>
            <Text style={styles.modalTitle}>Suspend User</Text>

            <Text style={styles.fieldLabel}>Days</Text>
            <TextInput
              value={suspendDays}
              onChangeText={setSuspendDays}
              keyboardType="number-pad"
              style={styles.searchInput}
            />

            <Text style={styles.fieldLabel}>Reason</Text>
            <TextInput
              value={suspendReason}
              onChangeText={setSuspendReason}
              placeholder="e.g. Suspicious activity"
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => setShowSuspendModal(false)}
                style={[styles.suspendBtn, { flex: 1 }]}
              >
                <Text style={styles.suspendBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (selected) {
                    await suspendUser(selected._id, Number(suspendDays) || 7, suspendReason || 'Suspended by admin');
                  }
                  setShowSuspendModal(false);
                  setSelected(null);
                }}
                style={[styles.banBtn, { flex: 1 }]}
              >
                <Text style={styles.banBtnText}>Confirm Suspend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  searchRow: { padding: 12, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  closeBtn: { color: COLORS.textMuted, fontSize: 22 },
  modalContent: { padding: 20, gap: 16 },
  userName: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  userEmail: { color: COLORS.textMuted, fontSize: 14 },
  fieldLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginTop: 8 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleChipText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 12 },
  statusRow: { flexDirection: 'row' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusActive: { backgroundColor: '#14532d' },
  statusBanned: { backgroundColor: '#7f1d1d' },
  statusPillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  suspendBtn: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: '#f59e0b', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  suspendBtnText: { color: '#f59e0b', fontWeight: '700' },
  banBtn: { backgroundColor: '#7f1d1d', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  banBtnText: { color: '#fff', fontWeight: '700' },
  unbanBtn: { backgroundColor: '#14532d', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  unbanBtnText: { color: '#fff', fontWeight: '700' },
  suspendOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  suspendCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 20, gap: 8 },
});
