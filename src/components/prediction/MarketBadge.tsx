import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/constants/colors';
import { MARKET_ICONS } from '@/constants/markets';

interface Props {
  market: string;
  prediction: string | boolean;
  line?: number;
}

const formatPrediction = (market: string, prediction: string | boolean, line?: number): string => {
  if (market === 'bts') return prediction ? 'BTS YES' : 'BTS NO';
  if (market === 'goalsOverUnder') return `${prediction} ${line ?? 2.5} GOALS`;
  if (market === 'cornersOverUnder') return `${prediction} ${line ?? 9.5} CORNERS`;
  if (market === 'yellowCards') return `${prediction} ${line ?? 3.5} CARDS`;
  if (market === 'doubleChance') {
    return prediction === 'HOME_OR_DRAW' ? 'HOME / DRAW' : 'AWAY / DRAW';
  }
  return String(prediction);
};

export const MarketBadge: React.FC<Props> = ({ market, prediction, line }) => {
  const icon = MARKET_ICONS[market] ?? '📊';
  const label = formatPrediction(market, prediction, line);

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: 4,
    }}>
      <Text style={{ fontSize: 12 }}>{icon}</Text>
      <Text style={{ color: COLORS.text, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
};
