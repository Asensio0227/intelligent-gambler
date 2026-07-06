import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ITicket } from '@/types/ticket.types';
import { COLORS } from '@/constants/colors';
import { TicketStatusBadge } from './TicketStatusBadge';
import { MARKET_LABELS, MARKET_ICONS } from '@/constants/markets';

interface Props {
  ticket: ITicket;
  fixtureTeams?: Record<string, { home: string; away: string }>;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZW', {
    timeZone: 'Africa/Harare',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const TicketCard: React.FC<Props> = ({ ticket, fixtureTeams = {} }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/ticket/${ticket._id}` as never)}
      style={styles.card}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={1}>{ticket.label}</Text>
        <TicketStatusBadge status={ticket.status} />
      </View>
      {(ticket as any)._isQueued && (
        <View style={styles.queuedBadge}>
          <Text style={styles.queuedText}>⏳ Queued — will sync when online</Text>
        </View>
      )}
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {ticket.summary.totalLegs} legs · Avg {Math.round(ticket.summary.averageConfidence)}% confidence
        </Text>
        <Text style={styles.date}>{formatDate(ticket.createdAt)}</Text>
      </View>

      {/* Show legs with team names */}
      {ticket.legs.slice(0, 3).map((leg, i) => {
        const fixtureKey = typeof leg.fixtureId === 'object' ? (leg.fixtureId as any)._id : leg.fixtureId;
        const teams = fixtureTeams[fixtureKey];
        return (
          <View key={i} style={styles.legRow}>
            <Text style={styles.legIcon}>{MARKET_ICONS[leg.market]}</Text>
            <View style={styles.legInfo}>
              {teams ? (
                <Text style={styles.legTeams} numberOfLines={1}>
                  {teams.home} vs {teams.away}
                </Text>
              ) : null}
              <Text style={styles.legMarket}>{MARKET_LABELS[leg.market]}</Text>
            </View>
            <Text style={styles.legSelection}>{leg.selection} · {leg.confidence}%</Text>
          </View>
        );
      })}
      {ticket.legs.length > 3 && (
        <Text style={styles.moreLegs}>+{ticket.legs.length - 3} more legs</Text>
      )}

      {ticket.summary.legsWon !== null && (
        <View style={styles.outcomes}>
          <Text style={styles.won}>✅ {ticket.summary.legsWon} won</Text>
          <Text style={styles.lost}>❌ {ticket.summary.legsLost} lost</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  label: { color: COLORS.text, fontSize: 15, fontWeight: '700', flex: 1 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { color: COLORS.textMuted, fontSize: 12 },
  date: { color: COLORS.textMuted, fontSize: 12 },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legIcon: { fontSize: 13 },
  legInfo: { flex: 1 },
  legTeams: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  legMarket: { color: COLORS.textMuted, fontSize: 11 },
  legSelection: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  moreLegs: { color: COLORS.textMuted, fontSize: 11, fontStyle: 'italic' },
  outcomes: { flexDirection: 'row', gap: 16 },
  won: { color: COLORS.success, fontSize: 12, fontWeight: '600' },
  lost: { color: COLORS.danger, fontSize: 12, fontWeight: '600' },
  queuedBadge: {
    backgroundColor: '#78350f',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  queuedText: { color: '#fde68a', fontSize: 11 },
});
