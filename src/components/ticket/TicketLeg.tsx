import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ITicketLeg } from '@/types/ticket.types';
import { COLORS } from '@/constants/colors';
import { MARKET_LABELS, MARKET_ICONS } from '@/constants/markets';
import { ConfidenceMeter } from '@/components/prediction/ConfidenceMeter';

interface Props {
  leg: ITicketLeg;
  index: number;
  homeTeam?: string;
  awayTeam?: string;
}

export const TicketLeg: React.FC<Props> = ({ leg, index, homeTeam, awayTeam }) => (
  <View style={styles.container}>
    <Text style={styles.index}>{index + 1}</Text>
    <View style={styles.content}>
      <View style={styles.row}>
        <Text style={styles.teams} numberOfLines={1}>
          {homeTeam ?? 'Home'} vs {awayTeam ?? 'Away'}
        </Text>
        {leg.outcome !== null && leg.outcome !== undefined && (
          <Text style={{ fontSize: 14 }}>{leg.outcome ? '✅' : '❌'}</Text>
        )}
      </View>
      <Text style={styles.market}>
        {MARKET_ICONS[leg.market]} {MARKET_LABELS[leg.market] ?? leg.market}
      </Text>
      <Text style={styles.selection}>{leg.selection}</Text>
      <ConfidenceMeter confidence={leg.confidence} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  index: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
    marginTop: 2,
  },
  content: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  teams: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1 },
  market: { color: COLORS.textMuted, fontSize: 12 },
  selection: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
});
