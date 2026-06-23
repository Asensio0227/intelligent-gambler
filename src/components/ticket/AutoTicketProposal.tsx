import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ITicketProposal } from '@/types/ticket.types';
import { COLORS } from '@/constants/colors';
import { MARKET_LABELS } from '@/constants/markets';

interface Props {
  proposal: ITicketProposal;
  onSave?: () => void;
}

export const AutoTicketProposal: React.FC<Props> = ({ proposal, onSave }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View>
        <Text style={styles.label}>{proposal.label}</Text>
        <Text style={styles.meta}>
          {proposal.totalLegs} legs · {Math.round(proposal.averageConfidence)}% avg confidence
        </Text>
      </View>
      <Text style={styles.confidence}>{Math.round(proposal.averageConfidence)}%</Text>
    </View>

    <View style={styles.legs}>
      {proposal.legs.map((leg, i) => (
        <View key={i} style={styles.leg}>
          <Text style={styles.legTeams} numberOfLines={1}>
            {leg.homeTeam} vs {leg.awayTeam}
          </Text>
          <Text style={styles.legDetails}>
            {MARKET_LABELS[leg.market] ?? leg.market} · {leg.selection} · {leg.confidence}%
          </Text>
        </View>
      ))}
    </View>

    {onSave && (
      <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>Save This Ticket</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  meta: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  confidence: { color: COLORS.success, fontSize: 28, fontWeight: '800' },
  legs: { gap: 8 },
  leg: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 2,
  },
  legTeams: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  legDetails: { color: COLORS.textMuted, fontSize: 12 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
