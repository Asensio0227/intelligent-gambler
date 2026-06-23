import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '@/store/adminStore';
import { usePredictionStore } from '@/store/predictionStore';
import { StatsCard } from '@/components/admin/StatsCard';
import { PredictionCard } from '@/components/prediction/PredictionCard';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';

export default function AdminDashboard() {
  const { stats, fetchStats, syncFixtures, isLoading } = useAdminStore();
  const { allPredictions, fixtureTeams, fetchAll } = usePredictionStore();

  useEffect(() => {
    fetchStats();
    fetchAll();
  }, [fetchStats, fetchAll]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Admin Dashboard" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatsCard icon="👥" label="Total Users" value={stats?.totalUsers ?? '—'} color={COLORS.primary} />
          <StatsCard icon="🎯" label="Predictions" value={stats?.totalPredictions ?? '—'} color={COLORS.success} />
          <StatsCard icon="🎫" label="Tickets" value={stats?.totalTickets ?? '—'} color={COLORS.warning} />
          <StatsCard icon="📅" label="Fixtures" value={stats?.fixturesSynced ?? '—'} color="#a855f7" />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={syncFixtures}
            style={[styles.actionBtn, { backgroundColor: '#1e3a5f' }]}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionLabel}>Sync Fixtures</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Predictions */}
        <Text style={styles.sectionTitle}>Recent Predictions</Text>
        {allPredictions.slice(0, 5).map((p) => {
          const fixtureKey = typeof p.fixtureId === 'object' ? (p.fixtureId as any)._id : p.fixtureId;
          const t = fixtureTeams[fixtureKey];
          return <PredictionCard key={p._id} prediction={p} homeTeam={t?.home} awayTeam={t?.away} />;
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: { fontSize: 24 },
  actionLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
});
