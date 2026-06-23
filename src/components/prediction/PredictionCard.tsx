import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IPrediction } from '@/types/prediction.types';
import { COLORS } from '@/constants/colors';
import { ConfidenceMeter } from './ConfidenceMeter';
import { MARKET_LABELS, MARKET_ICONS } from '@/constants/markets';

interface Props {
  prediction: IPrediction;
  homeTeam?: string;
  awayTeam?: string;
}

export const PredictionCard: React.FC<Props> = ({ prediction, homeTeam, awayTeam }) => {
  const router = useRouter();

  const topMarkets = Object.entries(prediction.markets)
    .sort(([, a], [, b]) => b.confidence - a.confidence)
    .slice(0, 3);

  const hasTeams = !!(homeTeam && awayTeam);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/prediction/${prediction._id}` as never)}
      style={styles.card}
      activeOpacity={0.8}
    >
      {/* Always show match header */}
      <View style={styles.matchHeader}>
        <Text style={styles.teams} numberOfLines={1}>
          {hasTeams ? `${homeTeam} vs ${awayTeam}` : '⏳ Loading teams...'}
        </Text>
        <Text style={styles.tapHint}>Tap for details →</Text>
      </View>

      {/* Top 3 markets with actual prediction values */}
      <View style={styles.markets}>
        {topMarkets.map(([key, market]) => {
          const predVal = typeof market.prediction === 'boolean'
            ? (market.prediction ? 'YES' : 'NO')
            : String(market.prediction);
          const lineStr = market.line ? ` ${market.line}` : '';
          return (
            <View key={key} style={styles.marketRow}>
              <Text style={styles.marketIcon}>{MARKET_ICONS[key]}</Text>
              <View style={styles.marketInfo}>
                <Text style={styles.marketLabel}>{MARKET_LABELS[key]}</Text>
                <Text style={styles.marketPrediction}>{predVal}{lineStr}</Text>
              </View>
              <View style={styles.meterWrap}>
                <ConfidenceMeter confidence={market.confidence} />
              </View>
            </View>
          );
        })}
      </View>
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
    gap: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teams: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  tapHint: {
    color: COLORS.primary,
    fontSize: 11,
  },
  markets: { gap: 8 },
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marketIcon: { fontSize: 14, width: 20 },
  marketInfo: { flex: 1 },
  marketLabel: { color: COLORS.textMuted, fontSize: 11 },
  marketPrediction: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  meterWrap: { width: 100 },
});
