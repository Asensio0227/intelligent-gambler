import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { usePredictionStore } from '@/store/predictionStore';
import { PredictionCard } from '@/components/prediction/PredictionCard';
import { Header } from '@/components/shared/Header';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS } from '@/constants/colors';
import { useRefresh } from '@/hooks/useRefresh';

export default function PredictionsScreen() {
  const { allPredictions, fixtureTeams, fetchAll, isLoading } = usePredictionStore();
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setTeamsLoading(true);
      await fetchAll();
      setTeamsLoading(false);
    };
    load();
  }, []);

  const { refreshing, handleRefresh } = useRefresh(async () => {
    setTeamsLoading(true);
    await fetchAll();
    setTeamsLoading(false);
  });

  if (isLoading || teamsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Predictions" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading predictions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Predictions" />
      <FlashList
        data={allPredictions}
        estimatedItemSize={120}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const fixtureKey = typeof item.fixtureId === 'object' ? (item.fixtureId as any)._id : item.fixtureId;
          const t = fixtureTeams[fixtureKey];
          return <PredictionCard prediction={item} homeTeam={t?.home} awayTeam={t?.away} />;
        }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyState icon="🎯" title="No predictions yet" subtitle="Predictions will appear here once generated" />
        }
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
});
