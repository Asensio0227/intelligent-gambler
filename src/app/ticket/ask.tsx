import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Animated,  } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTicketStore } from '@/store/ticketStore';
import { useAuthStore } from '@/store/authStore';
import { AutoTicketProposal } from '@/components/ticket/AutoTicketProposal';
import { Header } from '@/components/shared/Header';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS } from '@/constants/colors';

const SUGGESTIONS = [
  '3 high confidence tickets',
  '5 teams, goals markets only',
  'Brazil and Argentina matches',
  'Winner predictions only',
  'Mix of all markets, 6 legs each',
];

function AnimatedDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  const dotStyle = (opacity: Animated.Value) => ({
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary, marginHorizontal: 3,
    opacity,
    transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 24 }}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
}

export default function AskAIScreen() {
  const router = useRouter();
  const { proposals, askParams, isGenerating, isLoading, askQuery, confirmTickets, clearProposals } = useTicketStore();
  const { user } = useAuthStore();

  // Route guard — regular users cannot access this screen
  useEffect(() => {
    if (user?.role === 'user') {
      router.replace('/(tabs)/tickets');
    }
  }, [user]);

  const [query, setQuery] = useState('');

  const handleAsk = async () => {
    if (!query.trim()) return;
    await askQuery(query.trim());
  };

  const handleConfirmAll = async () => {
    await confirmTickets(proposals);
    router.replace('/(tabs)/tickets');
  };

  const handleTryAgain = () => {
    clearProposals();
    setQuery('');
  };

  const showResults = proposals.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Ask AI" showBack />

      {!showResults ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>Describe the tickets you want in plain English</Text>

          <View style={styles.inputCard}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={'e.g. Give me 3 tickets of 5 teams with high confidence goals markets'}
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={5}
              style={styles.textInput}
              textAlignVertical="top"
            />
          </View>

          {isGenerating ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingLabel}>AI is building your tickets...</Text>
              <AnimatedDots />
            </View>
          ) : (
            <>
              <Text style={styles.suggestionsLabel}>Suggestions</Text>
              <View style={styles.suggestionsContainer}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setQuery(s)}
                    style={[styles.suggestionChip, query === s && styles.suggestionChipActive]}
                  >
                    <Text style={[styles.suggestionText, query === s && styles.suggestionTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleAsk}
                disabled={!query.trim()}
                style={[styles.askBtn, !query.trim() && { opacity: 0.4 }]}
              >
                <Text style={styles.askBtnText}>🤖 Ask AI</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Interpreted Params Card */}
          {askParams && (
            <View style={styles.interpretedCard}>
              <Text style={styles.interpretedTitle}>I understood:</Text>
              <Text style={styles.interpretedText}>
                {askParams.numberOfTickets} ticket{askParams.numberOfTickets !== 1 ? 's' : ''}
                {' · '}{askParams.legsPerTicket} legs each
                {' · '}{askParams.minConfidence}% min confidence
                {askParams.preferredMarkets?.length
                  ? ` · ${askParams.preferredMarkets.join(', ')}`
                  : ''}
              </Text>
            </View>
          )}

          <View style={styles.proposalBar}>
            <Text style={styles.proposalCount}>{proposals.length} Proposals Ready</Text>
            <View style={styles.proposalActions}>
              <TouchableOpacity onPress={handleTryAgain} style={styles.tryAgainBtn}>
                <Text style={styles.tryAgainText}>↺ Try Again</Text>
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
              <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
                <AutoTicketProposal proposal={item} />
              </View>
            )}
            ListEmptyComponent={
              <EmptyState icon="🤖" title="No proposals returned" subtitle="Try rephrasing your request" />
            }
            contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 16 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
  },
  textInput: {
    color: COLORS.text,
    fontSize: 15,
    padding: 12,
    minHeight: 120,
    maxHeight: 192,
  },
  loadingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
  },
  loadingLabel: { color: COLORS.textMuted, fontSize: 14 },
  suggestionsLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  suggestionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionChipActive: { backgroundColor: '#1e3a5f', borderColor: COLORS.primary },
  suggestionText: { color: COLORS.textMuted, fontSize: 13 },
  suggestionTextActive: { color: COLORS.primary, fontWeight: '600' },
  askBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  askBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  interpretedCard: {
    backgroundColor: '#1e3a5f',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 2,
  },
  interpretedTitle: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  interpretedText: { color: COLORS.text, fontSize: 13 },
  proposalBar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  proposalCount: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  proposalActions: { flexDirection: 'row', gap: 10 },
  tryAgainBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  tryAgainText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  confirmBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
