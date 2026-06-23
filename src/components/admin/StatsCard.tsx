import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

export const StatsCard: React.FC<Props> = ({ icon, label, value, color = COLORS.primary }) => (
  <View style={[styles.card, { borderTopColor: color }]}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={[styles.value, { color }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 140,
  },
  icon: { fontSize: 24, marginBottom: 4 },
  value: { fontSize: 26, fontWeight: '800' },
  label: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
});
