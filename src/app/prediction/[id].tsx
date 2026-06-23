import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { IPrediction, ISimilarMatch } from '@/types/prediction.types';
import { usePredictionStore } from '@/store/predictionStore';
import { useAuthStore } from '@/store/authStore';
import { fixtureService } from '@/services/fixture.service';
import { predictionService } from '@/services/prediction.service';
import { AllMarketsView } from '@/components/prediction/AllMarketsView';
import { SimilarMatchesCard } from '@/components/prediction/SimilarMatchesCard';
import { ReasoningModal } from '@/components/prediction/ReasoningModal';
import { Header } from '@/components/shared/Header';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { COLORS } from '@/constants/colors';

export default function PredictionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchPrediction } = usePredictionStore();
  const { user } = useAuthStore();
  const [prediction, setPrediction] = useState<IPrediction | null>(null);
  const [similarMatches, setSimilarMatches] = useState<ISimilarMatch[]>([]);
  const [teams, setTeams] = useState<{ home: string; away: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const p = await fetchPrediction(id);
      setPrediction(p);

      // Fetch team names for this prediction's fixture
      // fixtureId may already be a populated Fixture object or a raw ID string
      if (p?.fixtureId) {
        const fxIdOrObj: any = p.fixtureId;
        if (typeof fxIdOrObj === 'object' && fxIdOrObj?.homeTeam?.name) {
          setTeams({ home: fxIdOrObj.homeTeam.name, away: fxIdOrObj.awayTeam?.name ?? 'Away' });
        } else {
          const fixtureIdValue = typeof fxIdOrObj === 'object' ? fxIdOrObj._id : fxIdOrObj;
          try {
            const fx = await fixtureService.getById(fixtureIdValue);
            const fxData = fx.data as any;
            if (fxData?.homeTeam?.name) {
              setTeams({ home: fxData.homeTeam.name, away: fxData.awayTeam?.name ?? 'Away' });
            }
          } catch {}
        }
      }

      // Fetch similar historical matches — silently no-op if embeddings disabled
      // (backend returns 403 in that case, which we just swallow here)
      try {
        const simRes = await predictionService.getSimilar(id, 3);
        setSimilarMatches((simRes.data as any) ?? []);
      } catch {
        setSimilarMatches([]);
      }

      setLoading(false);
    };
    if (id) load();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!prediction) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Prediction" showBack />
      {teams && (
        <View style={styles.matchBanner}>
          <Text style={styles.matchBannerText}>{teams.home} vs {teams.away}</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Markets</Text>
          <AllMarketsView prediction={prediction} showOutcome={prediction.outcome?.resolved} />
        </View>

        {similarMatches.length > 0 && (
          <SimilarMatchesCard matches={similarMatches} />
        )}

        <TouchableOpacity onPress={() => setShowReasoning(true)} style={styles.reasoningBtn}>
          <Text style={styles.reasoningBtnText}>View Reasoning 🧠</Text>
        </TouchableOpacity>

        {prediction.outcome?.resolved && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Outcome</Text>
            <Text style={styles.resolvedDate}>
              Resolved: {prediction.outcome.resolvedAt
                ? new Date(prediction.outcome.resolvedAt).toLocaleDateString('en-ZA')
                : '—'}
            </Text>
          </View>
        )}

        {isAdmin && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Token Usage</Text>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>Input tokens</Text>
              <Text style={styles.usageValue}>{prediction.tokensUsed?.input ?? 0}</Text>
            </View>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>Output tokens</Text>
              <Text style={styles.usageValue}>{prediction.tokensUsed?.output ?? 0}</Text>
            </View>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>Estimated cost</Text>
              <Text style={[styles.usageValue, { color: COLORS.warning }]}>
                ${prediction.tokensUsed?.totalCost?.toFixed(4) ?? '0.0000'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <ReasoningModal visible={showReasoning} prediction={prediction} onClose={() => setShowReasoning(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  matchBanner: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  matchBannerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: { padding: 20, gap: 16 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, gap: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  reasoningBtn: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary, padding: 14, alignItems: 'center' },
  reasoningBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  resolvedDate: { color: COLORS.textMuted, fontSize: 13 },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between' },
  usageLabel: { color: COLORS.textMuted, fontSize: 14 },
  usageValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
});
