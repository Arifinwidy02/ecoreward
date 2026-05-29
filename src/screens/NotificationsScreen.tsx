import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { AppNotification } from '../types/models';
import { EmptyState } from '../components/ui/EmptyState';

export function NotificationsScreen() {
  const session = useAuthStore((s) => s.session);
  const { notifications, isLoading, loadNotifications, markNotificationsAsRead } =
    useNotificationStore();

  useEffect(() => {
    if (session?.user?.id) {
      loadNotifications(session.user.id);
    }
  }, [session?.user?.id]);

  const handlePress = (notification: AppNotification) => {
    if (!notification.read) {
      markNotificationsAsRead([notification.id]);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={() => session?.user?.id && loadNotifications(session.user.id)}
        ListEmptyComponent={<EmptyState icon="bell-off" title="Belum ada notifikasi" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, !item.read && styles.unread]}
            onPress={() => handlePress(item)}
          >
            <Text style={styles.title}>{item.title}</Text>
            {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleString('id-ID')}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  item: { backgroundColor: '#fff', padding: 16, marginTop: 1 },
  unread: { backgroundColor: '#E8F5E9' },
  title: { fontSize: 15, fontWeight: '600', color: '#333' },
  body: { fontSize: 13, color: '#666', marginTop: 4 },
  date: { fontSize: 12, color: '#BDBDBD', marginTop: 8 },
});
