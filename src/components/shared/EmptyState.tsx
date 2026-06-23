import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<Props> = ({ icon = '📭', title, subtitle }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
    <Text style={{ fontSize: 48, marginBottom: 16 }}>{icon}</Text>
    <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8 }}>{title}</Text>
    {subtitle && <Text style={{ color: COLORS.textMuted, fontSize: 14, textAlign: 'center' }}>{subtitle}</Text>}
  </View>
);
