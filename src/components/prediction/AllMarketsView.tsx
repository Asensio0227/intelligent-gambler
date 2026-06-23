import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IPrediction } from '@/types/prediction.types';
import { COLORS } from '@/constants/colors';
import { ConfidenceMeter } from './ConfidenceMeter';
import { MARKET_LABELS, MARKET_ICONS } from '@/constants/markets';

interface Props {
  prediction: IPrediction;
  showOutcome?: boolean;
}

const formatPrediction = (market: string, value: string | boolean, line?: number): string => {
  if (typeof value === 'boolean') return value ? 'YES' : 'NO';
  if (market === 'goalsOverUnder' && line) return `${value} ${line}`;
  if (market === 'cornersOverUnder' && line) return `${value} ${line}`;
  if (market === 'yellowCards' && line) return `${value} ${line}`;
  return String(value);
};

export const AllMarketsView: React.FC<Props> = ({ prediction, showOutcome }) => (
  <View style={styles.container}>
    {Object.entries(prediction.markets).map(([key, market]) => {
      const outcome = prediction.outcome?.accuracy?.[key];
      return (
        <View key={key} style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.icon}>{MARKET_ICONS[key]}</Text>
            <View>
              <Text style={styles.label}>{MARKET_LABELS[key] ?? key}</Text>
              <Text style={styles.value}>{formatPrediction(key, market.prediction, market.line)}</Text>
            </View>
          </View>
          <View style={styles.right}>
            <ConfidenceMeter confidence={market.confidence} />
            {showOutcome && outcome !== undefined && outcome !== null && (
              <Text style={{ fontSize: 14, marginTop: 2 }}>{outcome ? '✅' : '❌'}</Text>
            )}
          </View>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  icon: { fontSize: 18, width: 24 },
  label: { color: COLORS.textMuted, fontSize: 12 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginTop: 1 },
  right: { width: 120, alignItems: 'flex-end', gap: 4 },
});
