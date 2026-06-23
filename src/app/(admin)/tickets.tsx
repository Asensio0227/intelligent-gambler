import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { adminService } from '@/services/admin.service';
import { useFixtureStore } from '@/store/fixtureStore';
import { TicketCard } from '@/components/ticket/TicketCard';
import { Header } from '@/components/shared/Header';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS } from '@/constants/colors';
import { ITicket } from '@/types/ticket.types';
import { useRefresh } from '@/hooks/useRefresh';

export default function AdminTicketsScreen() {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixtureTeams, setFixtureTeams] = useState<Record<string, { home: string; away: string }>>({});
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { fetchFixture } = useFixtureStore();

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

  const load = async (filters?: { status?: string; sort?: 'newest' | 'oldest' }) => {
    setLoading(true);
    try {
      const res = await adminService.getAllTickets(filters);
      const data: ITicket[] = (res.data as any) ?? [];
      setTickets(data);
      if (data.length) await loadTeams(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const { refreshing, handleRefresh } = useRefresh(() => load({ status: statusFilter ?? undefined, sort: sortOrder }));

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <Header title="All Tickets" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="All Tickets" showBack />

      <View style={styles.filterBar}>
        <View style={styles.statusChips}>
          {(['ALL', 'PENDING', 'WON', 'LOST', 'PARTIAL'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => {
                const next = s === 'ALL' ? null : s;
                setStatusFilter(next);
                load({ status: next ?? undefined, sort: sortOrder });
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
          load({ status: statusFilter ?? undefined, sort: next });
        }}
        style={styles.sortToggle}
      >
        <Text style={styles.sortToggleText}>
          {sortOrder === 'newest' ? '🔽 Newest first' : '🔼 Oldest first'}
        </Text>
      </TouchableOpacity>

      <FlashList
        estimatedItemSize={100}
        data={tickets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <TicketCard ticket={item} fixtureTeams={fixtureTeams} />}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={<EmptyState icon="🎫" title="No tickets yet" subtitle="Tickets will appear here once users create them" />}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterBar: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  statusChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  statusChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusChipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  sortToggle: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingBottom: 8 },
  sortToggleText: { color: COLORS.textMuted, fontSize: 12 },
});
