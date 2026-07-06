import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ITicket } from '@/types/ticket.types';
import { useTicketStore } from '@/store/ticketStore';
import { useFixtureStore } from '@/store/fixtureStore';
import { ticketService } from '@/services/ticket.service';
import { TicketLeg } from '@/components/ticket/TicketLeg';
import { TicketStatusBadge } from '@/components/ticket/TicketStatusBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Header } from '@/components/shared/Header';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { COLORS } from '@/constants/colors';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchTicket, deleteTicket } = useTicketStore();
  const { fetchFixture } = useFixtureStore();
  const router = useRouter();
  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [fixtureMap, setFixtureMap] = useState<Record<string, { home: string; away: string }>>({});
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const load = async (triggerResolve = false) => {
    setLoading(true);
    // If the ticket is pending, ask the server to run outcome resolution first
    // so the status we get back is always as fresh as possible.
    if (triggerResolve) {
      try { await ticketService.resolveTicket(id); } catch {}
    }
    const t = await fetchTicket(id);
    setTicket(t);
    if (t?.legs?.length) {
      const uniqueIds = [...new Set(t.legs.map((l: any) => l.fixtureId))];
      const map: Record<string, { home: string; away: string }> = {};
      await Promise.all(
        uniqueIds.map(async (fid: any) => {
          try {
            const fx = await fetchFixture(fid);
            if (fx?.homeTeam?.name) {
              map[fid] = { home: fx.homeTeam.name, away: fx.awayTeam?.name ?? 'Away' };
            }
          } catch {}
        })
      );
      setFixtureMap(map);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      // Trigger server-side resolve on first open so PENDING tickets update immediately
      load(true);
      // Then poll every 60s — server cron runs every 15 min, on-demand resolve covers the rest
      const interval = setInterval(() => load(false), 60000);
      return () => clearInterval(interval);
    }, [id])
  );

  const handleDelete = async () => {
    await deleteTicket(id);
    setShowDelete(false);
    router.back();
  };

  if (loading) return <LoadingScreen />;
  if (!ticket) return null;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-ZW', { timeZone: 'Africa/Harare', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Ticket" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header info */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.label} numberOfLines={2}>{ticket.label}</Text>
            <TicketStatusBadge status={ticket.status} />
          </View>
          <Text style={styles.date}>{fmt(ticket.createdAt)}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{ticket.summary.totalLegs}</Text>
            <Text style={styles.summaryLabel}>Legs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{Math.round(ticket.summary.averageConfidence)}%</Text>
            <Text style={styles.summaryLabel}>Avg Conf.</Text>
          </View>
          {ticket.summary.legsWon !== null && (
            <>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: COLORS.success }]}>{ticket.summary.legsWon}</Text>
                <Text style={styles.summaryLabel}>Won</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: COLORS.danger }]}>{ticket.summary.legsLost}</Text>
                <Text style={styles.summaryLabel}>Lost</Text>
              </View>
            </>
          )}
        </View>

        {/* Legs */}
        <View style={styles.legsCard}>
          <Text style={styles.sectionTitle}>Selections</Text>
          {ticket.legs.map((leg, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(`/prediction/${leg.predictionId}` as never)}
              activeOpacity={0.7}
            >
              <TicketLeg
                leg={leg}
                index={i}
                homeTeam={fixtureMap[leg.fixtureId]?.home}
                awayTeam={fixtureMap[leg.fixtureId]?.away}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Delete */}
        <TouchableOpacity onPress={() => setShowDelete(true)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Delete Ticket</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        danger
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 16 },
  headerCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, gap: 8, borderWidth: 1, borderColor: COLORS.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  label: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  date: { color: COLORS.textMuted, fontSize: 13 },
  summaryRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRightWidth: 1, borderRightColor: COLORS.border },
  summaryVal: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  legsCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  deleteBtn: { backgroundColor: '#450a0a', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger },
  deleteBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
});
