import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationStore } from '@/store/notificationStore';
import { Header } from '@/components/shared/Header';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS } from '@/constants/colors';

export default function NotificationsScreen() {
  const { notifications, fetchNotifications, markRead, markAllRead, deleteNotification, isLoading } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Notifications"
        showBack
        right={
          <TouchableOpacity onPress={markAllRead}>
            <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600' }}>All Read</Text>
          </TouchableOpacity>
        }
      />
      {isLoading && (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      )}
      <FlashList
          estimatedItemSize={80}
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markRead(item._id)}
            style={[styles.item, !item.read && styles.itemUnread]}
          >
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBody}>{item.body}</Text>
              <Text style={styles.itemDate}>
                {new Date(item.createdAt).toLocaleDateString('en-ZW', { timeZone: 'Africa/Harare' })}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteNotification(item._id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="🔔" title="No notifications" subtitle="You're all caught up!" />}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  itemUnread: { backgroundColor: '#1e293b', borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  itemContent: { flex: 1, gap: 4 },
  itemTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  itemBody: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  itemDate: { color: COLORS.textMuted, fontSize: 11 },
  deleteBtn: { padding: 4 },
  deleteText: { color: COLORS.textMuted, fontSize: 16 },
});
