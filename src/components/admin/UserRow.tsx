import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IUser } from '@/types/auth.types';
import { COLORS } from '@/constants/colors';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { Avatar } from '@/components/shared/Avatar';

interface Props {
  user: IUser;
  onPress?: () => void;
}

export const UserRow: React.FC<Props> = ({ user, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.7}>
    <Avatar name={`${user.name} ${user.lastName}`} size={40} />
    <View style={styles.info}>
      <Text style={styles.name}>{user.name} {user.lastName}</Text>
      <Text style={styles.email}>{user.email}</Text>
    </View>
    <View style={styles.badges}>
      <RoleBadge role={user.role} />
      <View style={[styles.activeDot, { backgroundColor: user.isActive ? COLORS.success : COLORS.danger }]} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
    backgroundColor: COLORS.surface,
  },
  info: { flex: 1 },
  name: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  email: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
});
