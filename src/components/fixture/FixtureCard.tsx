import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { IFixture } from '@/types/fixture.types';
import { COLORS } from '@/constants/colors';
import { LiveBadge } from './LiveBadge';

interface Props {
  fixture: IFixture;
  onPress?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  NS: COLORS.textMuted,
  LIVE: COLORS.live,
  FT: '#60a5fa',
  PST: COLORS.warning,
  CANC: COLORS.danger,
};

const formatKickoff = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-ZW', {
    timeZone: 'Africa/Harare',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const FixtureCard: React.FC<Props> = ({ fixture, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/fixture/${fixture._id}` as never);
    }
  };

  const isLive = fixture.status === 'LIVE';
  const isFT = fixture.status === 'FT';

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.league} numberOfLines={1}>
          {fixture.league.name} · {fixture.league.country}
        </Text>
        <View style={styles.statusRow}>
          {isLive ? (
            <LiveBadge />
          ) : (
            <Text style={[styles.status, { color: STATUS_COLORS[fixture.status] ?? COLORS.textMuted }]}>
              {fixture.status}
            </Text>
          )}
          {fixture.predictionGenerated && (
            <Text style={{ fontSize: 12, marginLeft: 6 }}>✅</Text>
          )}
        </View>
      </View>

      <View style={styles.matchRow}>
        <View style={styles.team}>
          <Image
            source={{ uri: fixture.homeTeam.logo }}
            style={styles.logo}
            contentFit="contain"
            placeholder={{ color: COLORS.border }}
          />
          <Text style={styles.teamName} numberOfLines={2}>{fixture.homeTeam.name}</Text>
        </View>

        <View style={styles.scoreBox}>
          {isFT && fixture.result.homeGoals !== null ? (
            <Text style={styles.score}>
              {fixture.result.homeGoals} — {fixture.result.awayGoals}
            </Text>
          ) : (
            <Text style={styles.vs}>VS</Text>
          )}
          <Text style={styles.kickoff}>{formatKickoff(fixture.kickoff)}</Text>
        </View>

        <View style={[styles.team, { alignItems: 'flex-end' }]}>
          <Image
            source={{ uri: fixture.awayTeam.logo }}
            style={styles.logo}
            contentFit="contain"
            placeholder={{ color: COLORS.border }}
          />
          <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={2}>
            {fixture.awayTeam.name}
          </Text>
        </View>
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
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  league: { color: COLORS.textMuted, fontSize: 12, flex: 1, marginRight: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  status: { fontSize: 11, fontWeight: '700' },
  matchRow: { flexDirection: 'row', alignItems: 'center' },
  team: { flex: 1, alignItems: 'flex-start', gap: 6 },
  logo: { width: 36, height: 36 },
  teamName: { color: COLORS.text, fontSize: 13, fontWeight: '600', lineHeight: 17 },
  scoreBox: { alignItems: 'center', paddingHorizontal: 8, minWidth: 80 },
  score: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  vs: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  kickoff: { color: COLORS.textMuted, fontSize: 10, marginTop: 4, textAlign: 'center' },
});
