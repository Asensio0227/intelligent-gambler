import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>The screen you're looking for doesn't exist.</Text>
      <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.btn}>
        <Text style={styles.btnText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 24 },
  code: { color: COLORS.primary, fontSize: 72, fontWeight: '900' },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginTop: 8 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' },
  btn: { marginTop: 28, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 32, paddingVertical: 14 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
