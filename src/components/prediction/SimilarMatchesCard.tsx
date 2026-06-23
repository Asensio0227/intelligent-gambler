import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ISimilarMatch } from '@/types/prediction.types';
import { COLORS } from '@/constants/colors';

interface Props {
  matches: ISimilarMatch[];
}

export const SimilarMatchesCard: React.FC<Props> = ({ matches }) => {
  if (!matches || matches.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🔁 Similar Historical Matches</Text>
      <Text style={styles.subtitle}>
        GPT used these past matchups as pattern reference when generating this prediction.
      </Text>
      {matches.map((m, i) => (
        <View key={i} style={[styles.row, i < matches.length - 1 && styles.rowBorder]}>
          <View style={styles.rowLeft}>
            <Text style={styles.teams} numberOfLines={1}>
              {m.homeTeam} vs {m.awayTeam}
            </Text>
            {m.score && m.score !== '0-0' && (
              <Text style={styles.score}>Final: {m.score}</Text>
            )}
          </View>
          <View style={styles.similarityBadge}>
            <Text style={styles.similarityText}>
              {Math.round((m.similarityScore ?? 0) * 100)}% match
            </Text>
          </View>
        </View>
      ))}
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
  subtitle: { color: COLORS.textMuted, fontSize: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLeft: { flex: 1, gap: 2 },
  teams: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  score: { color: COLORS.textMuted, fontSize: 12 },
  similarityBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  similarityText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
