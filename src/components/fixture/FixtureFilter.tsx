import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants/colors';

interface FilterOption {
  key: string;
  label: string;
}

interface Props {
  options: FilterOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export const FixtureFilter: React.FC<Props> = ({ options, selected, onSelect }) => (
  <View style={styles.wrapper}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          onPress={() => onSelect(opt.key)}
          style={[styles.chip, selected === opt.key && styles.chipActive]}
        >
          <Text style={[styles.chipText, selected === opt.key && styles.chipTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  container: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});
