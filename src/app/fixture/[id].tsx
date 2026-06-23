import { LiveBadge } from '@/components/fixture/LiveBadge';
import { AllMarketsView } from '@/components/prediction/AllMarketsView';
import { ReasoningModal } from '@/components/prediction/ReasoningModal';
import { Header } from '@/components/shared/Header';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useFixtureStore } from '@/store/fixtureStore';
import { usePredictionStore } from '@/store/predictionStore';
import { IFixture } from '@/types/fixture.types';
import { IPrediction } from '@/types/prediction.types';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fmt = (d: string) =>
  new Date(d).toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function FixtureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fetchFixture } = useFixtureStore();
  const { fetchPredictionForFixture, generatePrediction, generating } =
    usePredictionStore();
  const { user } = useAuthStore();

  const [fixture, setFixture] = useState<IFixture | null>(null);
  const [prediction, setPrediction] = useState<IPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);

  const canGeneratePredictions = user?.role === 'superadmin';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [f, p] = await Promise.all([
        fetchFixture(id),
        fetchPredictionForFixture(id),
      ]);
      setFixture(f);
      setPrediction(p);
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  const handleGenerate = async () => {
    if (!fixture) return;
    const p = await generatePrediction(fixture._id);
    if (p) {
      setPrediction(p);
    } else {
      Alert.alert('Error', 'Failed to generate prediction. Please try again.');
    }
  };

  if (loading) return <LoadingScreen />;
  if (!fixture) return null;

  const isFT = fixture.status === 'FT';
  const isLive = fixture.status === 'LIVE';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title='Match Details' showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {/* League */}
        <Text style={styles.league}>
          {fixture.league.name} · {fixture.league.country}
        </Text>

        {/* Teams */}
        <View style={styles.matchRow}>
          <View style={styles.team}>
            <Image
              source={{ uri: fixture.homeTeam.logo }}
              style={styles.logo}
              contentFit='contain'
            />
            <Text style={styles.teamName}>{fixture.homeTeam.name}</Text>
          </View>
          <View style={styles.center}>
            {isLive ? (
              <LiveBadge />
            ) : isFT && fixture.result?.homeGoals != null ? (
              <Text style={styles.score}>
                {fixture.result.homeGoals} — {fixture.result.awayGoals}
              </Text>
            ) : (
              <Text style={styles.vs}>VS</Text>
            )}
          </View>
          <View style={[styles.team, { alignItems: 'flex-end' }]}>
            <Image
              source={{ uri: fixture.awayTeam.logo }}
              style={styles.logo}
              contentFit='contain'
            />
            <Text style={[styles.teamName, { textAlign: 'right' }]}>
              {fixture.awayTeam.name}
            </Text>
          </View>
        </View>

        <Text style={styles.kickoff}>{fmt(fixture.kickoff)}</Text>
        {fixture.venue && <Text style={styles.venue}>📍 {fixture.venue}</Text>}

        {/* Half-time if available */}
        {isFT && fixture.result?.htHomeGoals != null && (
          <Text style={styles.ht}>
            HT: {fixture.result.htHomeGoals} — {fixture.result.htAwayGoals}
          </Text>
        )}

        {/* Stats if FT */}
        {isFT && (fixture.result?.corners || fixture.result?.yellowCards) && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>
                {fixture.result?.corners?.home ?? '—'}
              </Text>
              <Text style={styles.statLabel}>Corners</Text>
              <Text style={styles.statVal}>
                {fixture.result?.corners?.away ?? '—'}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>
                {fixture.result?.yellowCards?.home ?? '—'}
              </Text>
              <Text style={styles.statLabel}>Yellow Cards</Text>
              <Text style={styles.statVal}>
                {fixture.result?.yellowCards?.away ?? '—'}
              </Text>
            </View>
          </View>
        )}

        {/* Prediction Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Prediction</Text>
          {prediction ? (
            <>
              <AllMarketsView prediction={prediction} showOutcome={isFT} />
              <TouchableOpacity
                onPress={() => setShowReasoning(true)}
                style={styles.reasoningBtn}
              >
                <Text style={styles.reasoningBtnText}>View Reasoning 🧠</Text>
              </TouchableOpacity>

              {prediction?._id && (
                <TouchableOpacity
                  onPress={() => router.push(`/prediction/${prediction._id}` as never)}
                  style={styles.fullDetailsBtn}
                >
                  <Text style={styles.fullDetailsBtnText}>View Full Prediction Details →</Text>
                </TouchableOpacity>
              )}

              {canGeneratePredictions && (
                <TouchableOpacity
                  onPress={handleGenerate}
                  disabled={generating}
                  style={styles.regenerateBtn}
                >
                  {generating ? (
                    <ActivityIndicator color={COLORS.warning} />
                  ) : (
                    <Text style={styles.regenerateBtnText}>🔁 Regenerate Prediction</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : canGeneratePredictions ? (
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={generating}
              style={styles.generateBtn}
            >
              {generating ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <Text style={styles.generateBtnText}>
                  ✨ Generate Prediction
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.noPrediction}>No prediction available yet</Text>
          )}
        </View>
      </ScrollView>

      {prediction && (
        <ReasoningModal
          visible={showReasoning}
          prediction={prediction}
          onClose={() => setShowReasoning(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 16 },
  league: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
  matchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  team: { flex: 1, alignItems: 'flex-start', gap: 8 },
  logo: { width: 56, height: 56 },
  teamName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  center: { alignItems: 'center', paddingHorizontal: 8, minWidth: 80 },
  score: { color: COLORS.text, fontSize: 28, fontWeight: '900' },
  vs: { color: COLORS.textMuted, fontSize: 16, fontWeight: '700' },
  kickoff: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
  venue: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  ht: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  statVal: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: 12 },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  reasoningBtn: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
  },
  reasoningBtnText: { color: COLORS.primary, fontWeight: '600' },
  fullDetailsBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  fullDetailsBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  regenerateBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  regenerateBtnText: { color: COLORS.warning, fontWeight: '700', fontSize: 15 },
  generateBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  noPrediction: {
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
