import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { MARKET_LABELS, MARKET_ICONS } from '@/constants/markets';

interface MarketAccuracyStat {
  market: string;
  totalResolved: number;
  correct: number;
  accuracyPct: number;
}

interface Props {
  stats: MarketAccuracyStat[];
}

export const MarketAccuracyCard: React.FC<Props> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>📊 Market Accuracy</Text>
        <Text style={styles.empty}>
          Not enough resolved predictions yet to calculate accuracy. Check back once more matches finish.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>📊 Market Accuracy</Text>
      <Text style={styles.subtitle}>Rolling accuracy from last 200 resolved predictions per market.</Text>
      {stats.map((s) => {
        const color =
          s.accuracyPct >= 70 ? COLORS.success : s.accuracyPct >= 55 ? COLORS.warning : COLORS.danger;
        return (
          <View key={s.market} style={styles.row}>
            <Text style={styles.marketIcon}>{MARKET_ICONS[s.market] ?? '📈'}</Text>
            <View style={styles.rowInfo}>
              <Text style={styles.marketLabel}>{MARKET_LABELS[s.market] ?? s.market}</Text>
              <Text style={styles.sampleSize}>{s.totalResolved} resolved samples</Text>
            </View>
            <Text style={[styles.accuracyText, { color }]}>{s.accuracyPct}%</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  subtitle: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  empty: { color: COLORS.textMuted, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  marketIcon: { fontSize: 16 },
  rowInfo: { flex: 1 },
  marketLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  sampleSize: { color: COLORS.textMuted, fontSize: 11 },
  accuracyText: { fontSize: 16, fontWeight: '700' },
});
