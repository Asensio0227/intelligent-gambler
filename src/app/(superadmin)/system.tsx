import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '@/store/adminStore';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';

const CONFIG_LABELS: Record<string, string> = {
  STRIPE_ENABLED: 'Stripe Payments',
  EMBEDDINGS_ENABLED: 'AI Embeddings',
  PREDICTION_MODE: 'Prediction Mode',
  FIXTURE_SOURCE: 'Fixture Source',
};

export default function SystemScreen() {
  const { systemConfig, fetchSystemConfig } = useAdminStore();

  useEffect(() => { fetchSystemConfig(); }, [fetchSystemConfig]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="System Config" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.note}>
          ⚠️ Configuration is read-only here. Changes must be made via the server .env file.
        </Text>
        <View style={styles.card}>
          {Object.entries(systemConfig).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.key}>{CONFIG_LABELS[key] ?? key}</Text>
              <View style={[
                styles.valueBadge,
                { backgroundColor: value === true || value === 'true' ? '#14532d' : '#1e293b' }
              ]}>
                <Text style={[
                  styles.valueText,
                  { color: value === true || value === 'true' ? COLORS.success : COLORS.text }
                ]}>
                  {String(value)}
                </Text>
              </View>
            </View>
          ))}
          {Object.keys(systemConfig).length === 0 && (
            <Text style={styles.empty}>No config data available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 16 },
  note: { color: COLORS.warning, fontSize: 13, lineHeight: 20, backgroundColor: '#451a03', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.warning },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, gap: 0, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  key: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1 },
  valueBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  valueText: { fontSize: 12, fontWeight: '700' },
  empty: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 },
});
