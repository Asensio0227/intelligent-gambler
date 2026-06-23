import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAdminStore } from '@/store/adminStore';
import { usePredictionStore } from '@/store/predictionStore';
import { StatsCard } from '@/components/admin/StatsCard';
import { MarketAccuracyCard } from '@/components/admin/MarketAccuracyCard';
import { PredictionCard } from '@/components/prediction/PredictionCard';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';
import { superadminService } from '@/services/superadmin.service';

const NAV_ITEMS = [
  { label: 'Manage Admins', icon: '👤', route: '/(superadmin)/admins' },
  { label: 'API Usage', icon: '📊', route: '/(superadmin)/usage' },
  { label: 'System Config', icon: '⚙️', route: '/(superadmin)/system' },
  { label: 'Admin Panel', icon: '🛠️', route: '/(admin)' },
];

export default function SuperadminDashboard() {
  const { stats, usage, fetchStats, fetchUsage } = useAdminStore();
  const { allPredictions, fixtureTeams, fetchAll } = usePredictionStore();
  const router = useRouter();
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [marketAccuracy, setMarketAccuracy] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchUsage();
    const load = async () => {
      setTeamsLoading(true);
      await fetchAll();
      setTeamsLoading(false);
    };
    load();

    const loadMarketAccuracy = async () => {
      try {
        const res = await superadminService.getMarketAccuracy();
        setMarketAccuracy((res.data as any) ?? []);
      } catch {
        setMarketAccuracy([]);
      }
    };
    loadMarketAccuracy();
  }, [fetchStats, fetchUsage, fetchAll]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Superadmin" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>System Stats</Text>
        <View style={styles.statsGrid}>
          <StatsCard icon="👥" label="Users" value={stats?.totalUsers ?? '—'} color={COLORS.primary} />
          <StatsCard icon="🎯" label="Predictions" value={stats?.totalPredictions ?? '—'} color={COLORS.success} />
          <StatsCard icon="🎫" label="Tickets" value={stats?.totalTickets ?? '—'} color={COLORS.warning} />
          <StatsCard icon="📅" label="Fixtures" value={stats?.fixturesSynced ?? '—'} color="#a855f7" />
        </View>

        {usage && (
          <>
            <Text style={styles.sectionTitle}>This Month's Usage</Text>
            <View style={styles.usageCard}>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Predictions Generated</Text>
                <Text style={styles.usageValue}>{usage.predictionsGenerated}</Text>
              </View>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Tokens Used</Text>
                <Text style={styles.usageValue}>{(usage.tokensUsed ?? 0).toLocaleString()}</Text>
              </View>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Estimated Cost</Text>
                <Text style={[styles.usageValue, { color: COLORS.warning }]}>${(usage.estimatedCost ?? 0).toFixed(4)}</Text>
              </View>
            </View>
          </>
        )}

        <MarketAccuracyCard stats={marketAccuracy} />

        <Text style={styles.sectionTitle}>Recent Predictions</Text>
        {teamsLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 12 }} />
        ) : (
          allPredictions.slice(0, 5).map((p) => {
            const fixtureKey = typeof p.fixtureId === 'object' ? (p.fixtureId as any)._id : p.fixtureId;
            const t = fixtureTeams[fixtureKey];
            return <PredictionCard key={p._id} prediction={p} homeTeam={t?.home} awayTeam={t?.away} />;
          })
        )}

        <Text style={styles.sectionTitle}>Quick Links</Text>
        <View style={styles.navGrid}>
          {NAV_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push(item.route as never)}
              style={styles.navItem}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 16 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  usageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between' },
  usageLabel: { color: COLORS.textMuted, fontSize: 14 },
  usageValue: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  navItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navIcon: { fontSize: 28 },
  navLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
