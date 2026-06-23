import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useNotifications } from '@/hooks/useNotifications';

interface Props {
  title: string;
  showBack?: boolean;
  showNotifications?: boolean;
  right?: React.ReactNode;
}

export const Header: React.FC<Props> = ({ title, showBack, showNotifications, right }) => {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>
        {showNotifications && (
          <TouchableOpacity onPress={() => router.push('/notifications' as never)} style={styles.bellBtn}>
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {right}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { flex: 1, textAlign: 'center', color: COLORS.text, fontSize: 17, fontWeight: '700' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: COLORS.primary, fontSize: 22 },
  right: { width: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  bellBtn: { position: 'relative' },
  bellIcon: { fontSize: 22 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.danger,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
