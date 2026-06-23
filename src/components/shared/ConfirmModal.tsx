import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal: React.FC<Props> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            style={[styles.confirmBtn, { backgroundColor: danger ? COLORS.danger : COLORS.primary }]}
          >
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  box: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, width: '85%', borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { color: COLORS.textMuted, fontWeight: '600' },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600' },
});
