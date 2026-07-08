import React, { useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { usePredictionStore } from '@/store/predictionStore';
import { PredictionCard } from '@/components/prediction/PredictionCard';
import { Header } from '@/components/shared/Header';
import { EmptyState } from '@/components/shared/EmptyState';
import { FixtureFilter } from '@/components/fixture/FixtureFilter';
import { COLORS } from '@/constants/colors';
import { useRefresh } from '@/hooks/useRefresh';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

type SortOrder = 'desc' | 'asc';
type DateQuickFilter = 'all' | 'today' | 'tomorrow' | 'custom';

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

const SORT_OPTIONS = [
  { key: 'desc', label: 'Newest first' },
  { key: 'asc', label: 'Oldest first' },
];

const DATE_OPTIONS = [
  { key: 'all', label: 'All dates' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'custom', label: 'Custom date' },
];

export default function PredictionsScreen() {
  const { allPredictions, fixtureTeams, fetchAll, isLoading } = usePredictionStore();
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [teamQuery, setTeamQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('desc');
  const [dateFilter, setDateFilter] = useState<DateQuickFilter>('all');
  const [customDate, setCustomDate] = useState(''); // YYYY-MM-DD

  const debouncedTeam = useDebouncedValue(teamQuery, 400);

  const resolvedDate = useMemo(() => {
    if (dateFilter === 'today') return toISODate(new Date());
    if (dateFilter === 'tomorrow') {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      return toISODate(t);
    }
    if (dateFilter === 'custom') {
      // Only send it once it looks like a complete date
      return /^\d{4}-\d{2}-\d{2}$/.test(customDate) ? customDate : undefined;
    }
    return undefined;
  }, [dateFilter, customDate]);

  const load = async () => {
    setTeamsLoading(true);
    await fetchAll({
      team: debouncedTeam.trim() || undefined,
      date: resolvedDate,
      sort,
    });
    setTeamsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTeam, resolvedDate, sort]);

  const { refreshing, handleRefresh } = useRefresh(async () => {
    await load();
  });

  const hasActiveFilters = !!debouncedTeam.trim() || dateFilter !== 'all' || sort !== 'desc';

  const clearFilters = () => {
    setTeamQuery('');
    setSort('desc');
    setDateFilter('all');
    setCustomDate('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Predictions" />

      <View style={styles.searchWrapper}>
        <TextInput
          value={teamQuery}
          onChangeText={setTeamQuery}
          placeholder="Search by team name..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FixtureFilter options={DATE_OPTIONS} selected={dateFilter} onSelect={(k) => setDateFilter(k as DateQuickFilter)} />

      {dateFilter === 'custom' && (
        <View style={styles.customDateWrapper}>
          <TextInput
            value={customDate}
            onChangeText={setCustomDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      )}

      <View style={styles.sortRow}>
        <FixtureFilter options={SORT_OPTIONS} selected={sort} onSelect={(k) => setSort(k as SortOrder)} />
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading || teamsLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading predictions...</Text>
        </View>
      ) : (
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
            hasActiveFilters ? (
              <EmptyState icon="🔎" title="No matching predictions" subtitle="Try a different team, date, or clear your filters" />
            ) : (
              <EmptyState icon="🎯" title="No predictions yet" subtitle="Predictions will appear here once generated" />
            )
          }
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, backgroundColor: COLORS.background },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 15,
  },
  customDateWrapper: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: COLORS.surface },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  clearButton: { paddingHorizontal: 10, paddingVertical: 6 },
  clearButtonText: { color: COLORS.danger, fontSize: 12, fontWeight: '600' },
});
