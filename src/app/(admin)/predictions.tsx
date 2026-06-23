import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { usePredictionStore } from '@/store/predictionStore';
import { PredictionCard } from '@/components/prediction/PredictionCard';
import { Header } from '@/components/shared/Header';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS } from '@/constants/colors';
import { IPrediction } from '@/types/prediction.types';

export default function AdminPredictionsScreen() {
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

  const renderItem = useCallback(({ item }: { item: IPrediction }) => {
    const fixtureKey = typeof item.fixtureId === 'object' ? (item.fixtureId as any)._id : item.fixtureId;
    const t = fixtureTeams[fixtureKey];
    return <PredictionCard prediction={item} homeTeam={t?.home} awayTeam={t?.away} />;
  }, [fixtureTeams]);

  if (isLoading || teamsLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <Header title="All Predictions" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading predictions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="All Predictions" showBack />
      <FlashList
        estimatedItemSize={120}
        data={allPredictions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyState icon="🎯" title="No predictions yet" />}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}
