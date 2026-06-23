import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '@/store/adminStore';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';

export default function UsageScreen() {
  const { usage, perUserUsage, fetchUsage } = useAdminStore();

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="API Usage" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {usage && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>This Month</Text>
            <View style={styles.bigStat}>
              <Text style={styles.bigStatValue}>{usage.predictionsGenerated}</Text>
              <Text style={styles.bigStatLabel}>Predictions Generated</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tokens Used</Text>
              <Text style={styles.value}>{(usage?.tokensUsed ?? 0).toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Estimated Cost</Text>
              <Text style={[styles.value, { color: COLORS.warning }]}>${(usage?.estimatedCost ?? 0).toFixed(4)}</Text>
            </View>
          </View>
        )}

        {perUserUsage.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Per User Breakdown</Text>
            {perUserUsage.map((item: any, index: number) => {
              const user = item.user ?? item;
              const u = item.usage ?? item;
              const key = user?._id ?? index;
              return (
                <View key={key} style={styles.userRow}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user?.name ?? '—'} {user?.lastName ?? ''}</Text>
                    <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
                  </View>
                  <View style={styles.userStats}>
                    <Text style={styles.userStat}>{u?.predictionsGenerated ?? 0} preds</Text>
                    <Text style={[styles.userStat, { color: COLORS.warning }]}>${(u?.estimatedCost ?? 0).toFixed(4)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 16 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, gap: 12, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  bigStat: { alignItems: 'center', paddingVertical: 12 },
  bigStatValue: { color: COLORS.primary, fontSize: 48, fontWeight: '900' },
  bigStatLabel: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  label: { color: COLORS.textMuted, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  userInfo: { flex: 1 },
  userName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  userEmail: { color: COLORS.textMuted, fontSize: 12 },
  userStats: { alignItems: 'flex-end', gap: 2 },
  userStat: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
});
