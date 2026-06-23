import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  role: 'superadmin' | 'admin' | 'user';
}

const ROLE_CONFIG = {
  superadmin: { label: 'Superadmin', bg: '#7c3aed', text: '#fff' },
  admin: { label: 'Admin', bg: COLORS.primary, text: '#fff' },
  user: { label: 'User', bg: COLORS.surface, text: COLORS.textMuted },
};

export const RoleBadge: React.FC<Props> = ({ role }) => {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;
  return (
    <View style={{ backgroundColor: config.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
      <Text style={{ color: config.text, fontSize: 11, fontWeight: '600' }}>{config.label}</Text>
    </View>
  );
};
