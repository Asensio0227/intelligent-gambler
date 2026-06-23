import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { LoginForm } from '@/components/auth/LoginForm';
import { COLORS } from '@/constants/colors';

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      await login({ email, password });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Login failed. Check your credentials.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>⚽</Text>
          <Text style={styles.title}>Intelligent Gambler</Text>
          <Text style={styles.subtitle}>Sign in to access your predictions</Text>
        </View>

        <View style={styles.card}>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerLink}>
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: COLORS.textMuted, fontSize: 15, marginTop: 6 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  registerLink: { marginTop: 24, alignItems: 'center' },
  registerText: { color: COLORS.textMuted, fontSize: 14 },
});
