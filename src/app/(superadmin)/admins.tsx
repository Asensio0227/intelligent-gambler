import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,  } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '@/store/adminStore';
import { UserRow } from '@/components/admin/UserRow';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Header } from '@/components/shared/Header';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS } from '@/constants/colors';

export default function AdminsScreen() {
  const { admins, fetchAdmins, createAdmin, removeAdmin, isLoading } = useAdminStore();
  const [showAdd, setShowAdd] = useState(false);
  const [toRemove, setToRemove] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return;
    setAdding(true);
    await createAdmin(form);
    setAdding(false);
    setShowAdd(false);
    setForm({ name: '', lastName: '', email: '', password: '' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Manage Admins"
        showBack
        right={
          <TouchableOpacity onPress={() => setShowAdd(true)}>
            <Text style={{ color: COLORS.primary, fontSize: 22 }}>+</Text>
          </TouchableOpacity>
        }
      />
      <FlashList
          estimatedItemSize={80}
        data={admins}
        keyExtractor={(u) => u._id}
        renderItem={({ item }) => (
          <UserRow user={item} onPress={() => setToRemove(item._id)} />
        )}
        ListEmptyComponent={<EmptyState icon="👤" title="No admins yet" subtitle="Tap + to add an admin" />}
      />

      {/* Add Admin Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Admin</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {(['name', 'lastName', 'email', 'password'] as const).map((field) => (
              <View key={field} style={styles.field}>
                <Text style={styles.label}>{field === 'lastName' ? 'Last Name' : field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                <TextInput
                  value={form[field]}
                  onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                  secureTextEntry={field === 'password'}
                  autoCapitalize={field === 'email' ? 'none' : 'words'}
                  keyboardType={field === 'email' ? 'email-address' : 'default'}
                  placeholderTextColor={COLORS.textMuted}
                  placeholder={`Enter ${field}`}
                  style={styles.input}
                />
              </View>
            ))}
            <TouchableOpacity onPress={handleAdd} disabled={adding} style={styles.addBtn}>
              {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add Admin</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={!!toRemove}
        title="Remove Admin"
        message="Remove this admin's privileges? They will be demoted to a regular user."
        confirmLabel="Remove"
        onConfirm={async () => { if (toRemove) await removeAdmin(toRemove); setToRemove(null); }}
        onCancel={() => setToRemove(null)}
        danger
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
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
  field: { gap: 6 },
  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
  },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
