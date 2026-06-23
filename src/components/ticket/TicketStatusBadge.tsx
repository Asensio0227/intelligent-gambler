import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  status: 'PENDING' | 'WON' | 'LOST' | 'PARTIAL';
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', bg: COLORS.surface, text: COLORS.textMuted, border: COLORS.border },
  WON: { label: 'Won', bg: '#14532d', text: COLORS.success, border: COLORS.success },
  LOST: { label: 'Lost', bg: '#450a0a', text: COLORS.danger, border: COLORS.danger },
  PARTIAL: { label: 'Partial', bg: '#451a03', text: COLORS.warning, border: COLORS.warning },
};

export const TicketStatusBadge: React.FC<Props> = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <View style={{ backgroundColor: config.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: config.border }}>
      <Text style={{ color: config.text, fontSize: 11, fontWeight: '700' }}>{config.label}</Text>
    </View>
  );
};
