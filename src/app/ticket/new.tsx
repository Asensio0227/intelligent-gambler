import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFixtureStore } from '@/store/fixtureStore';
import { useTicketStore } from '@/store/ticketStore';
import { IFixture } from '@/types/fixture.types';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';
import { MARKET_LABELS, MARKET_ICONS } from '@/constants/markets';
import { usePredictionStore } from '@/store/predictionStore';
import { IPrediction } from '@/types/prediction.types';

interface SelectedLeg {
  predictionId: string;
  fixtureId: string;
  market: string;
  selection: string;
  confidence: number;
  homeTeam: string;
  awayTeam: string;
}

const DRAFT_KEY = 'ticket_draft_v1';

const formatKickoff = (d: string) =>
  new Date(d).toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatPrediction = (market: string, value: string | boolean, line?: number): string => {
  if (typeof value === 'boolean') return value ? 'YES' : 'NO';
  if ((market === 'goalsOverUnder' || market === 'cornersOverUnder' || market === 'yellowCards') && line) {
    return `${value} ${line}`;
  }
  return String(value);
};

export default function NewTicketScreen() {
  const router = useRouter();
  const { fixtures, fetchFixtures } = useFixtureStore();
  const { fetchPredictionForFixture, predictions } = usePredictionStore();
  const { createTicket } = useTicketStore();

  const [label, setLabel] = useState('');
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);
  const [selectedLegs, setSelectedLegs] = useState<SelectedLeg[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchFixtures({ predictionGenerated: 'true' } as any);
  }, [fetchFixtures]);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const saved = await AsyncStorage.getItem(DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.label) setLabel(draft.label);
          if (draft.selectedLegs) setSelectedLegs(draft.selectedLegs);
        }
      } catch {}
    };
    loadDraft();
  }, []);

  useEffect(() => {
    const saveDraft = async () => {
      try {
        if (selectedLegs.length > 0 || label.trim()) {
          await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({ label, selectedLegs }));
        } else {
          await AsyncStorage.removeItem(DRAFT_KEY);
        }
      } catch {}
    };
    saveDraft();
  }, [label, selectedLegs]);

  const handleExpandFixture = async (fixture: IFixture) => {
    const fid = fixture._id;
    if (expandedFixture === fid) {
      setExpandedFixture(null);
      return;
    }
    setExpandedFixture(fid);
    if (!predictions[fid]) {
      setLoadingPredictions((p) => ({ ...p, [fid]: true }));
      await fetchPredictionForFixture(fid);
      setLoadingPredictions((p) => ({ ...p, [fid]: false }));
    }
  };

  const toggleLeg = (leg: SelectedLeg) => {
    const key = `${leg.fixtureId}-${leg.market}`;
    const exists = selectedLegs.find((l) => `${l.fixtureId}-${l.market}` === key);
    if (exists) {
      setSelectedLegs((prev) => prev.filter((l) => `${l.fixtureId}-${l.market}` !== key));
    } else {
      setSelectedLegs((prev) => [...prev, leg]);
    }
  };

  const isLegSelected = (fixtureId: string, market: string) =>
    selectedLegs.some((l) => l.fixtureId === fixtureId && l.market === market);

  const avgConfidence =
    selectedLegs.length > 0
      ? Math.round(selectedLegs.reduce((s, l) => s + l.confidence, 0) / selectedLegs.length)
      : 0;

  const handleCreate = async () => {
    setError('');
    const finalLabel = label.trim() || `Ticket – ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`;
    if (selectedLegs.length < 1) { setError(`Select at least 1 leg.`); return; }
    if (selectedLegs.length > 8) { setError(`Maximum 8 legs allowed (${selectedLegs.length} selected).`); return; }

    setSaving(true);
    const ticket = await createTicket({
      label: finalLabel,
      legs: selectedLegs.map((l) => ({
        predictionId: l.predictionId,
        fixtureId: l.fixtureId,
        market: l.market,
        selection: l.selection,
        confidence: l.confidence,
      })),
    } as any);
    setSaving(false);

    if (ticket) {
      await AsyncStorage.removeItem(DRAFT_KEY);
      setShowReviewModal(false);
      router.replace(`/ticket/${ticket._id}` as never);
    } else {
      setError('Failed to create ticket. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Create Ticket" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Fixtures with Predictions */}
        <Text style={styles.sectionTitle}>Add Legs</Text>
        <Text style={styles.sectionSubtitle}>
          Tap a fixture to expand its markets, then tap a market to add it to your ticket.
        </Text>

        {/* Past fixtures toggle */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>Show past fixtures</Text>
          <Switch
            value={showPast}
            onValueChange={setShowPast}
            thumbColor={showPast ? COLORS.primary : COLORS.textMuted}
            trackColor={{ true: '#1a56db55', false: COLORS.border }}
          />
        </View>

        {fixtures.filter((f) => {
          if (!f.predictionGenerated) return false;
          const kickoff = new Date(f.kickoff);
          const isPast = kickoff < new Date();
          return showPast ? true : !isPast;
        }).map((fixture) => {
          const isExpanded = expandedFixture === fixture._id;
          const prediction: IPrediction | undefined = predictions[fixture._id];
          const isLoadingPred = loadingPredictions[fixture._id];
          const isPast = new Date(fixture.kickoff) < new Date();

          return (
            <View key={fixture._id} style={styles.fixtureBlock}>
              <TouchableOpacity
                onPress={() => handleExpandFixture(fixture)}
                style={[styles.fixtureRow, isExpanded && styles.fixtureRowExpanded, isPast && { opacity: 0.4 }]}
                activeOpacity={0.8}
              >
                <View style={styles.fixtureTeams}>
                  <Image source={{ uri: fixture.homeTeam.logo }} style={styles.teamLogo} contentFit="contain" />
                  <Text style={styles.fixtureTeamNames} numberOfLines={1}>
                    {fixture.homeTeam.name} vs {fixture.awayTeam.name}
                  </Text>
                  <Image source={{ uri: fixture.awayTeam.logo }} style={styles.teamLogo} contentFit="contain" />
                </View>
                <Text style={styles.fixtureKickoff}>{formatKickoff(fixture.kickoff)}</Text>
                <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.marketsContainer}>
                  {isLoadingPred ? (
                    <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 16 }} />
                  ) : prediction ? (
                    <View style={styles.marketsGrid}>
                      {Object.entries(prediction.markets).map(([market, data]) => {
                        const selected = isLegSelected(fixture._id, market);
                        const selectionText = formatPrediction(market, data.prediction, data.line);
                        return (
                          <TouchableOpacity
                            key={market}
                            onPress={() =>
                              toggleLeg({
                                predictionId: prediction._id,
                                fixtureId: fixture._id,
                                market,
                                selection: selectionText,
                                confidence: data.confidence,
                                homeTeam: fixture.homeTeam.name,
                                awayTeam: fixture.awayTeam.name,
                              })
                            }
                            style={[styles.marketChip, selected && styles.marketChipSelected]}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.marketChipIcon}>{MARKET_ICONS[market]}</Text>
                            <Text style={[styles.marketChipLabel, selected && styles.marketChipLabelSelected]}>
                              {MARKET_LABELS[market]}
                            </Text>
                            <Text style={[styles.marketChipSel, selected && styles.marketChipSelSelected]}>
                              {selectionText}
                            </Text>
                            <Text style={[styles.marketChipConf, selected && { color: '#fff' }]}>
                              {data.confidence}%
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.noPredText}>No prediction loaded</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {fixtures.filter((f) => f.predictionGenerated).length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No fixtures with predictions available</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button — shows ticket builder */}
      {selectedLegs.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowReviewModal(true)}
          style={styles.fab}
          activeOpacity={0.85}
        >
          <Text style={styles.fabCount}>{selectedLegs.length}</Text>
          <Text style={styles.fabIcon}>🎫</Text>
        </TouchableOpacity>
      )}

      {/* Full-screen review modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Ticket</Text>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Ticket Label</Text>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="e.g. Saturday Premier League Acca"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
                autoFocus
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.sectionTitle}>Selected Legs ({selectedLegs.length}/8)</Text>
            {selectedLegs.map((leg, i) => (
              <View key={i} style={styles.legRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legTeams} numberOfLines={1}>
                    {leg.homeTeam} vs {leg.awayTeam}
                  </Text>
                  <Text style={styles.legText} numberOfLines={1}>
                    {MARKET_ICONS[leg.market]} {MARKET_LABELS[leg.market]} · {leg.selection} · {leg.confidence}%
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toggleLeg(leg)}>
                  <Text style={styles.removeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {selectedLegs.length} legs · Avg {avgConfidence}% confidence
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={saving || selectedLegs.length < 1 || selectedLegs.length > 8}
            style={[
              styles.createBtn,
              (saving || selectedLegs.length < 1 || selectedLegs.length > 8) && { opacity: 0.5 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createBtnText}>Create Ticket</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 14, paddingBottom: 160 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 15,
  },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginTop: 4 },
  sectionSubtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: -8 },
  fixtureBlock: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fixtureRow: {
    backgroundColor: COLORS.surface,
    padding: 14,
    gap: 6,
  },
  fixtureRowExpanded: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  fixtureTeams: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamLogo: { width: 20, height: 20 },
  fixtureTeamNames: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: '600' },
  fixtureKickoff: { color: COLORS.textMuted, fontSize: 11 },
  expandIcon: { color: COLORS.textMuted, fontSize: 10, position: 'absolute', right: 14, top: 14 },
  marketsContainer: { backgroundColor: COLORS.background, padding: 12 },
  marketsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  marketChip: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  marketChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  marketChipIcon: { fontSize: 14 },
  marketChipLabel: { color: COLORS.textMuted, fontSize: 11 },
  marketChipLabelSelected: { color: 'rgba(255,255,255,0.8)' },
  marketChipSel: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  marketChipSelSelected: { color: '#fff' },
  marketChipConf: { color: COLORS.success, fontSize: 12, fontWeight: '600' },
  noPredText: { color: COLORS.textMuted, fontSize: 13, padding: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    gap: 10,
  },
  errorText: { color: COLORS.danger, fontSize: 13, textAlign: 'center' },
  legsSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legsSummaryText: { color: COLORS.textMuted, fontSize: 13 },
  legsCount: { color: COLORS.success, fontSize: 14, fontWeight: '700' },
  legsCountLow: { color: COLORS.warning },
  legsCountHigh: { color: COLORS.danger },
  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: { fontSize: 22 },
  fabCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
    zIndex: 1,
  },
  modalSafeArea: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  modalClose: { color: COLORS.textMuted, fontSize: 22 },
  modalContent: { padding: 20, gap: 12, paddingBottom: 40 },
  legRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legTeams: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  legText: { color: COLORS.text, fontSize: 13, flex: 1 },
  removeIcon: { color: COLORS.danger, fontSize: 16, paddingLeft: 12 },
  summaryRow: { paddingTop: 12, alignItems: 'center' },
  summaryText: { color: COLORS.textMuted, fontSize: 13 },
});
