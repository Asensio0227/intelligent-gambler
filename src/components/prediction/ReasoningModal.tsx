import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { IPrediction } from '@/types/prediction.types';
import { COLORS } from '@/constants/colors';
import { MARKET_LABELS, MARKET_ICONS } from '@/constants/markets';

interface Props {
  visible: boolean;
  prediction: IPrediction;
  onClose: () => void;
}

export const ReasoningModal: React.FC<Props> = ({ visible, prediction, onClose }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reasoning</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.text}>{prediction.reasoning.summary}</Text>
        </View>
        {Object.entries(prediction.reasoning.perMarket ?? {}).map(([market, reason]) => (
          <View key={market} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {MARKET_ICONS[market]} {MARKET_LABELS[market] ?? market}
            </Text>
            <Text style={styles.text}>{reason}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  close: { color: COLORS.textMuted, fontSize: 20 },
  content: { padding: 20, gap: 20 },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  text: { color: COLORS.textMuted, fontSize: 14, lineHeight: 21 },
});
