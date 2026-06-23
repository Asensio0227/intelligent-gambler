import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '@/store/adminStore';
import { useFixtureStore } from '@/store/fixtureStore';
import { FixtureList } from '@/components/fixture/FixtureList';
import { FixtureFilter } from '@/components/fixture/FixtureFilter';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'NS', label: 'Upcoming' },
  { key: 'LIVE', label: 'Live' },
  { key: 'FT', label: 'Finished' },
];

export default function AdminFixturesScreen() {
  const { syncFixtures } = useAdminStore();
  const { fixtures, fetchFixtures, isLoading } = useFixtureStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    fetchFixtures(activeFilter !== 'all' ? { status: activeFilter } : undefined);
  }, [activeFilter]);

  const handleSync = async () => {
    setSyncing(true);
    await syncFixtures();
    setLastSync(new Date().toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' }));
    await fetchFixtures();
    setSyncing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Fixtures" showBack />
      <View style={styles.syncBar}>
        {lastSync && <Text style={styles.lastSync}>Last sync: {lastSync}</Text>}
        <TouchableOpacity onPress={handleSync} disabled={syncing} style={styles.syncBtn}>
          {syncing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.syncBtnText}>🔄 Sync Now</Text>}
        </TouchableOpacity>
      </View>
      <FixtureFilter options={FILTERS} selected={activeFilter} onSelect={setActiveFilter} />
      <FixtureList fixtures={fixtures} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  syncBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastSync: { color: COLORS.textMuted, fontSize: 12 },
  syncBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  syncBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
