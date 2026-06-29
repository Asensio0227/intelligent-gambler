import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useTicketStore } from '@/store/ticketStore';
import { useFixtureStore } from '@/store/fixtureStore';
import { useAuthStore } from '@/store/authStore';
import { TicketCard } from '@/components/ticket/TicketCard';
import { AutoTicketProposal } from '@/components/ticket/AutoTicketProposal';
import { EmptyState } from '@/components/shared/EmptyState';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';
import { PREFERRED_MARKET_OPTIONS } from '@/constants/markets';
import { useRefresh } from '@/hooks/useRefresh';
import { ticketService } from '@/services/ticket.service';
import { IAutoGenerateParams, ITicket } from '@/types/ticket.types';

type ActiveTab = 'tickets' | 'auto' | 'ask';

export default function TicketsScreen() {
  const router = useRouter();
  const {
    tickets, proposals, isLoading, isGenerating,
    fetchMyTickets, autoGenerate, confirmTickets, askQuery, clearProposals,
  } = useTicketStore();
  const { fetchFixture } = useFixtureStore();
  const [fixtureTeams, setFixtureTeams] = useState<Record<string, { home: string; away: string }>>({});

  const loadTeams = async (ticketList: ITicket[]) => {
    const allFixtureIds = [...new Set(ticketList.flatMap((t) => t.legs.map((l) => l.fixtureId)))];
    const map: Record<string, { home: string; away: string }> = {};
    await Promise.allSettled(
      allFixtureIds.map(async (fid) => {
        try {
          const fx = await fetchFixture(fid);
          if (fx?.homeTeam?.name) {
            map[fid] = { home: fx.homeTeam.name, away: fx.awayTeam?.name ?? 'Away' };
          }
        } catch {}
      })
    );
    setFixtureTeams(map);
  };

  const { user } = useAuthStore();
  const isAdminOrAbove = user?.role === 'admin' || user?.role === 'superadmin';

  const [activeTab, setActiveTab] = useState<ActiveTab>('tickets');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Change 5 — reset to My Tickets if user loses access to admin tabs
  useEffect(() => {
    if (!isAdminOrAbove && (activeTab === 'auto' || activeTab === 'ask')) {
      setActiveTab('tickets');
    }
  }, [isAdminOrAbove, activeTab]);
  const [askText, setAskText] = useState('');
  const [params, setParams] = useState<IAutoGenerateParams>({
    numberOfTickets: 3,
    legsPerTicket: 5,
    minConfidence: 65,
    diversify: true,
    preferredMarkets: [],
  });

  useEffect(() => {
    const load = async () => {
      await fetchMyTickets();
      const { tickets: t } = useTicketStore.getState();
      if (t.length) await loadTeams(t);
    };
    load();
  }, [fetchMyTickets]);

  const { refreshing, handleRefresh } = useRefresh(fetchMyTickets);

  useFocusEffect(
    useCallback(() => {
      fetchMyTickets();
      // On focus, trigger server-side resolve if any visible tickets are pending
      const triggerResolveIfNeeded = async () => {
        const { tickets: current } = useTicketStore.getState();
        const hasPending = current.some((t) => t.status === 'PENDING');
        if (hasPending) {
          try {
            // Resolve the first pending ticket — runResolveOutcomes on the server
            // resolves ALL pending tickets in one pass, so one call is enough.
            const first = current.find((t) => t.status === 'PENDING');
            if (first) await ticketService.resolveTicket(first._id);
          } catch {}
          await useTicketStore.getState().refreshTicketStatuses();
        }
      };
      triggerResolveIfNeeded();
      const interval = setInterval(() => {
        useTicketStore.getState().refreshTicketStatuses();
      }, 60000);
      return () => clearInterval(interval);
    }, [])
  );

  const handleAutoGenerate = async () => {
    await autoGenerate(params);
  };

  const handleConfirmAll = async () => {
    await confirmTickets(proposals);
    setActiveTab('tickets');
  };

  const handleAsk = async () => {
    if (!askText.trim()) return;
    await askQuery(askText.trim());
  };

  const toggleMarket = (key: string) => {
    setParams((p) => {
      const markets = p.preferredMarkets ?? [];
      return {
        ...p,
        preferredMarkets: markets.includes(key)
          ? markets.filter((m) => m !== key)
          : [...markets, key],
      };
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Tickets" />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={() => router.push('/ticket/new')}
          style={styles.actionBtnPrimary}
        >
          <Text style={styles.actionBtnPrimaryText}>+ Manual</Text>
        </TouchableOpacity>

        {isAdminOrAbove && (
          <>
            <TouchableOpacity
              onPress={() => router.push('/ticket/auto')}
              style={styles.actionBtnSecondary}
            >
              <Text style={styles.actionBtnSecondaryText}>⚡ Auto Build</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/ticket/ask')}
              style={styles.actionBtnSecondary}
            >
              <Text style={styles.actionBtnSecondaryText}>🤖 Ask AI</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => { setActiveTab('tickets'); clearProposals(); }}
          style={[styles.tabItem, activeTab === 'tickets' && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.tabTextActive]}>My Tickets</Text>
        </TouchableOpacity>

        {isAdminOrAbove && (
          <>
            <TouchableOpacity
              onPress={() => { setActiveTab('auto'); clearProposals(); }}
              style={[styles.tabItem, activeTab === 'auto' && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === 'auto' && styles.tabTextActive]}>Auto Build</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setActiveTab('ask'); clearProposals(); }}
              style={[styles.tabItem, activeTab === 'ask' && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === 'ask' && styles.tabTextActive]}>Ask AI</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* My Tickets */}
      {activeTab === 'tickets' && (
        <>
          <View style={styles.filterBar}>
            <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterToggle}>
              <Text style={styles.filterToggleText}>⚙️ Filters</Text>
            </TouchableOpacity>
            <View style={styles.statusChips}>
              {(['ALL', 'PENDING', 'WON', 'LOST', 'PARTIAL'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    const next = s === 'ALL' ? null : s;
                    setStatusFilter(next);
                    fetchMyTickets({ status: next ?? undefined, sort: sortOrder });
                  }}
                  style={[styles.statusChip, (statusFilter === s || (s === 'ALL' && !statusFilter)) && styles.statusChipActive]}
                >
                  <Text style={[styles.statusChipText, (statusFilter === s || (s === 'ALL' && !statusFilter)) && { color: '#fff' }]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              const next = sortOrder === 'newest' ? 'oldest' : 'newest';
              setSortOrder(next);
              fetchMyTickets({ status: statusFilter ?? undefined, sort: next });
            }}
            style={styles.sortToggle}
          >
            <Text style={styles.sortToggleText}>
              {sortOrder === 'newest' ? '🔽 Newest first' : '🔼 Oldest first'}
            </Text>
          </TouchableOpacity>

          {isLoading && tickets.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
          <FlashList
            estimatedItemSize={80}
            data={tickets}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <TicketCard ticket={item} fixtureTeams={fixtureTeams} />}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <EmptyState icon="🎫" title="No tickets yet" subtitle="Use Auto Build or Ask AI to create your first ticket" />
            }
            contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
          />
          )}
        </>
      )}

      {/* Auto Build */}
      {activeTab === 'auto' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {proposals.length === 0 ? (
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Auto Build Settings</Text>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Number of Tickets: {params.numberOfTickets}</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity onPress={() => setParams((p) => ({ ...p, numberOfTickets: Math.max(1, p.numberOfTickets - 1) }))} style={styles.stepBtn}>
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{params.numberOfTickets}</Text>
                  <TouchableOpacity onPress={() => setParams((p) => ({ ...p, numberOfTickets: Math.min(10, p.numberOfTickets + 1) }))} style={styles.stepBtn}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Legs Per Ticket: {params.legsPerTicket}</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity onPress={() => setParams((p) => ({ ...p, legsPerTicket: Math.max(5, p.legsPerTicket - 1) }))} style={styles.stepBtn}>
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{params.legsPerTicket}</Text>
                  <TouchableOpacity onPress={() => setParams((p) => ({ ...p, legsPerTicket: Math.min(8, p.legsPerTicket + 1) }))} style={styles.stepBtn}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Min Confidence: {params.minConfidence}%</Text>
              </View>
              <View style={styles.sliderRow}>
                {[50, 55, 60, 65, 70, 75, 80, 85, 90].map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setParams((p) => ({ ...p, minConfidence: v }))}
                    style={[styles.sliderChip, params.minConfidence === v && styles.sliderChipActive]}
                  >
                    <Text style={[styles.sliderChipText, params.minConfidence === v && styles.sliderChipTextActive]}>{v}%</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Diversify Markets</Text>
                <Switch
                  value={params.diversify}
                  onValueChange={(v) => setParams((p) => ({ ...p, diversify: v }))}
                  thumbColor={params.diversify ? COLORS.primary : COLORS.textMuted}
                  trackColor={{ true: '#1a56db55', false: COLORS.border }}
                />
              </View>

              <Text style={styles.formLabel}>Preferred Markets</Text>
              <View style={styles.marketChips}>
                {PREFERRED_MARKET_OPTIONS.map((m) => {
                  const selected = params.preferredMarkets?.includes(m.key);
                  return (
                    <TouchableOpacity
                      key={m.key}
                      onPress={() => toggleMarket(m.key)}
                      style={[styles.marketChip, selected && styles.marketChipActive]}
                    >
                      <Text style={[styles.marketChipText, selected && styles.marketChipTextActive]}>{m.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={handleAutoGenerate}
                disabled={isGenerating}
                style={[styles.generateBtn, isGenerating && { opacity: 0.6 }]}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.generateBtnText}>Generate Tickets</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.proposalsContainer}>
              <View style={styles.proposalHeader}>
                <Text style={styles.sectionTitle}>{proposals.length} Proposals Ready</Text>
                <View style={styles.proposalActions}>
                  <TouchableOpacity onPress={clearProposals} style={styles.regenBtn}>
                    <Text style={styles.regenBtnText}>Regenerate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleConfirmAll} style={styles.confirmBtn}>
                    <Text style={styles.confirmBtnText}>Confirm All</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {proposals.map((p, i) => (
                <AutoTicketProposal key={i} proposal={p} />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Ask AI */}
      {activeTab === 'ask' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {proposals.length === 0 ? (
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Ask AI</Text>
              <Text style={styles.formLabel}>Describe the tickets you want:</Text>
              <TextInput
                value={askText}
                onChangeText={setAskText}
                placeholder={`e.g. "3 tickets, 5 legs, high confidence goals markets"`}
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                style={styles.askInput}
              />
              <View style={styles.suggestions}>
                {[
                  '3 tickets of 5 teams high confidence',
                  'goals markets only, Brazil matches',
                  'corners and cards, 6 legs each',
                ].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setAskText(s)} style={styles.suggestion}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={handleAsk}
                disabled={isGenerating || !askText.trim()}
                style={[styles.generateBtn, (isGenerating || !askText.trim()) && { opacity: 0.5 }]}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.generateBtnText}>Build Tickets</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.proposalsContainer}>
              <View style={styles.proposalHeader}>
                <Text style={styles.sectionTitle}>{proposals.length} Proposals Ready</Text>
                <View style={styles.proposalActions}>
                  <TouchableOpacity onPress={clearProposals} style={styles.regenBtn}>
                    <Text style={styles.regenBtnText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleConfirmAll} style={styles.confirmBtn}>
                    <Text style={styles.confirmBtnText}>Confirm All</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {proposals.map((p, i) => (
                <AutoTicketProposal key={i} proposal={p} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  actionBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  actionBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnSecondaryText: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  filterBar: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterToggle: { alignSelf: 'flex-end' },
  filterToggleText: { color: COLORS.primary, fontSize: 12 },
  statusChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  statusChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusChipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  sortToggle: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingBottom: 8 },
  sortToggleText: { color: COLORS.textMuted, fontSize: 12 },
  scrollContent: { padding: 16, gap: 16 },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  formRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formLabel: { color: COLORS.textMuted, fontSize: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  stepValue: { color: COLORS.text, fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  sliderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sliderChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sliderChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sliderChipText: { color: COLORS.textMuted, fontSize: 12 },
  sliderChipTextActive: { color: '#fff', fontWeight: '700' },
  marketChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  marketChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  marketChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  marketChipText: { color: COLORS.textMuted, fontSize: 13 },
  marketChipTextActive: { color: '#fff', fontWeight: '600' },
  generateBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  askInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  suggestions: { gap: 8 },
  suggestion: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: { color: COLORS.textMuted, fontSize: 13, fontStyle: 'italic' },
  proposalsContainer: { gap: 16 },
  proposalHeader: { gap: 12 },
  proposalActions: { flexDirection: 'row', gap: 12 },
  regenBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  regenBtnText: { color: COLORS.textMuted, fontWeight: '600' },
  confirmBtn: { flex: 2, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.success, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
});
