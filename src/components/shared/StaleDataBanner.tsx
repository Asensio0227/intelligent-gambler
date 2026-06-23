import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  onRefresh: () => void;
  cachedAt?: number;
}

export const StaleDataBanner: React.FC<Props> = ({ onRefresh, cachedAt }) => {
  const timeAgo = cachedAt
    ? Math.round((Date.now() - cachedAt) / 60000)
    : null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        ⚠️ Showing cached data
        {timeAgo ? ` from ${timeAgo} min ago` : ''}
      </Text>
      <TouchableOpacity onPress={onRefresh} style={styles.btn}>
        <Text style={styles.btnText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 6,
  },
  text: { color: '#f59e0b', fontSize: 12, flex: 1 },
  btn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnText: { color: '#000', fontSize: 12, fontWeight: '700' },
});
