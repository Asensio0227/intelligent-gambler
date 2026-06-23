import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTicketStore } from '@/store/ticketStore';
import { useAuthStore } from '@/store/authStore';
import { AutoTicketProposal } from '@/components/ticket/AutoTicketProposal';
import { Header } from '@/components/shared/Header';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS } from '@/constants/colors';
import { IAutoGenerateParams } from '@/types/ticket.types';

const MARKET_OPTIONS = [
  { key: 'result', label: 'Result' },
  { key: 'bts', label: 'BTS' },
  { key: 'goalsOverUnder', label: 'Goals O/U' },
  { key: 'cornersOverUnder', label: 'Corners' },
  { key: 'yellowCards', label: 'Cards' },
  { key: 'correctScore', label: 'Correct Score' },
  { key: 'highestScoringHalf', label: '1st/2nd Half' },
];

const LEG_RANGE = [5, 6, 7, 8];
const CONF_RANGE = [50, 55, 60, 65, 70, 75, 80, 85, 90];

export default function AutoTicketScreen() {
  const router = useRouter();
  const { proposals, isGenerating, isLoading, autoGenerate, confirmTickets, clearProposals } = useTicketStore();
  const { user } = useAuthStore();

  // Route guard — regular users cannot access this screen
  useEffect(() => {
    if (user?.role === 'user') {
      router.replace('/(tabs)/tickets');
    }
  }, [user]);

  const [params, setParams] = useState<IAutoGenerateParams>({
    numberOfTickets: 3,
    legsPerTicket: 5,
    minConfidence: 70,
    diversify: true,
    preferredMarkets: [],
  });

  const toggleMarket = (key: string) =>
    setParams((p) => {
      const markets = p.preferredMarkets ?? [];
      return {
        ...p,
        preferredMarkets: markets.includes(key)
          ? markets.filter((m) => m !== key)
          : [...markets, key],
      };
    });

  const handleGenerate = () => autoGenerate(params);

  const handleConfirmAll = async () => {
    try {
      await confirmTickets(proposals);
      router.replace('/(tabs)/tickets');
    } catch {
      Alert.alert('Error', 'Failed to save tickets. Please try again.');
    }
  };

  const showForm = proposals.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Auto Build" showBack />

      {showForm ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            {/* Number of Tickets */}
            <View style={styles.row}>
              <Text style={styles.fieldLabel}>Number of Tickets</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => setParams((p) => ({ ...p, numberOfTickets: Math.max(1, p.numberOfTickets - 1) }))}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepValue}>{params.numberOfTickets}</Text>
                <TouchableOpacity
                  onPress={() => setParams((p) => ({ ...p, numberOfTickets: Math.min(10, p.numberOfTickets + 1) }))}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Legs Per Ticket */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Legs Per Ticket: <Text style={styles.fieldValue}>{params.legsPerTicket}</Text></Text>
              <View style={styles.chipRow}>
                {LEG_RANGE.map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setParams((p) => ({ ...p, legsPerTicket: v }))}
                    style={[styles.chip, params.legsPerTicket === v && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, params.legsPerTicket === v && styles.chipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Min Confidence */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Min Confidence: <Text style={styles.fieldValue}>{params.minConfidence}%</Text></Text>
              <View style={styles.chipRow}>
                {CONF_RANGE.map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setParams((p) => ({ ...p, minConfidence: v }))}
                    style={[styles.chip, params.minConfidence === v && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, params.minConfidence === v && styles.chipTextActive]}>{v}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Diversify */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Diversify</Text>
                <Text style={styles.fieldHint}>No repeated fixtures across tickets</Text>
              </View>
              <Switch
                value={params.diversify}
                onValueChange={(v) => setParams((p) => ({ ...p, diversify: v }))}
                thumbColor={params.diversify ? COLORS.primary : COLORS.textMuted}
                trackColor={{ true: '#1a56db55', false: COLORS.border }}
              />
            </View>

            {/* Preferred Markets */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Preferred Markets</Text>
              <View style={styles.marketGrid}>
                {MARKET_OPTIONS.map((m) => {
                  const sel = params.preferredMarkets?.includes(m.key);
                  return (
                    <TouchableOpacity
                      key={m.key}
                      onPress={() => toggleMarket(m.key)}
                      style={[styles.marketChip, sel && styles.marketChipActive]}
                    >
                      <Text style={[styles.marketChipText, sel && styles.marketChipTextActive]}>{m.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleGenerate}
              disabled={isGenerating}
              style={[styles.primaryBtn, isGenerating && { opacity: 0.6 }]}
            >
              {isGenerating ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.primaryBtnText}>Generating...</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>⚡ Generate Tickets</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.proposalBar}>
            <Text style={styles.proposalCount}>{proposals.length} Proposals Ready</Text>
            <View style={styles.proposalActions}>
              <TouchableOpacity onPress={() => { clearProposals(); }} style={styles.regenBtn}>
                <Text style={styles.regenBtnText}>↺ Regenerate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmAll}
                disabled={isLoading}
                style={[styles.confirmBtn, isLoading && { opacity: 0.6 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>✓ Confirm & Save All</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <FlashList
          estimatedItemSize={80}
            data={proposals}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={styles.proposalItem}>
                <AutoTicketProposal proposal={item} />
              </View>
            )}
            ListEmptyComponent={
              <EmptyState icon="🎫" title="No proposals returned" subtitle="Try adjusting your settings" />
            }
            contentContainerStyle={{ padding: 16, gap: 14, flexGrow: 1 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  fieldValue: { color: COLORS.primary },
  fieldHint: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  fieldBlock: { gap: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  stepValue: { color: COLORS.text, fontSize: 18, fontWeight: '800', minWidth: 28, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textMuted, fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  marketGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  marketChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  marketChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  marketChipText: { color: COLORS.textMuted, fontSize: 13 },
  marketChipTextActive: { color: '#fff', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  proposalBar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  proposalCount: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  proposalActions: { flexDirection: 'row', gap: 10 },
  regenBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  regenBtnText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  confirmBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  proposalItem: { marginBottom: 0 },
});
