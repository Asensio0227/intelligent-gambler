import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFixtureStore } from '@/store/fixtureStore';
import { FixtureList } from '@/components/fixture/FixtureList';
import { FixtureFilter } from '@/components/fixture/FixtureFilter';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';
import { LIVE_REFRESH_INTERVAL } from '@/constants/config';
import { useRefresh } from '@/hooks/useRefresh';
import { useNotificationStore } from '@/store/notificationStore';
import { StaleDataBanner } from '@/components/shared/StaleDataBanner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'LIVE', label: '🔴 Live' },
  { key: 'NS', label: 'Upcoming' },
  { key: 'FT', label: 'Finished' },
];

export default function HomeScreen() {
  const {
    fixtures, upcomingFixtures, liveFixtures,
    fetchFixtures, fetchUpcoming, fetchLive,
    isLoading, isStale, cachedAt,
  } = useFixtureStore();
  const { fetchUnreadCount } = useNotificationStore();
  const { isOffline } = useNetworkStatus();
  const [activeFilter, setActiveFilter] = useState('all');
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const liveTimerRef = useRef<ReturnType<typeof setInterval>>();

  const loadData = useCallback(async () => {
    setFilterLoading(true);
    await fetchUnreadCount();
    if (activeFilter === 'all') {
      await fetchFixtures();
    } else if (activeFilter === 'LIVE') {
      await fetchLive();
    } else if (activeFilter === 'NS') {
      await fetchUpcoming();
    } else if (activeFilter === 'FT') {
      await fetchFixtures({
        status: 'FT',
        search: searchQuery.trim() || undefined,
        sort: sortOrder,
      });
    }
    setFilterLoading(false);
  }, [activeFilter, searchQuery, sortOrder]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (activeFilter === 'LIVE') {
      liveTimerRef.current = setInterval(() => fetchLive(), LIVE_REFRESH_INTERVAL);
    }
    return () => { if (liveTimerRef.current) clearInterval(liveTimerRef.current); };
  }, [activeFilter]);

  useEffect(() => {
    if (activeFilter === 'FT') {
      loadData();
    }
  }, [sortOrder]);

  useEffect(() => {
    if (activeFilter !== 'FT') return;
    const debounce = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const { refreshing, handleRefresh } = useRefresh(loadData);

  const displayFixtures =
    activeFilter === 'LIVE' ? liveFixtures
    : activeFilter === 'NS' ? upcomingFixtures
    : fixtures;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Intelligent Gambler" showNotifications />
      <FixtureFilter
        options={FILTER_OPTIONS}
        selected={activeFilter}
        onSelect={setActiveFilter}
      />
      {activeFilter === 'FT' && (
        <View style={styles.finishedControls}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadData}
            placeholder="Search by team name..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={() => {
              const next = sortOrder === 'asc' ? 'desc' : 'asc';
              setSortOrder(next);
            }}
            style={styles.sortBtn}
          >
            <Text style={styles.sortBtnText}>
              {sortOrder === 'asc' ? '↑ Oldest first' : '↓ Newest first'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {(isStale || isOffline) && (
        <StaleDataBanner onRefresh={loadData} cachedAt={cachedAt ?? undefined} />
      )}
      {filterLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading fixtures...</Text>
        </View>
      ) : (
        <FixtureList
          fixtures={displayFixtures}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  finishedControls: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  sortBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  sortBtnText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
});
