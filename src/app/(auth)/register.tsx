import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { IRegisterPayload } from '@/types/auth.types';
import { COLORS } from '@/constants/colors';

export default function RegisterScreen() {
  const { register, isLoading } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: IRegisterPayload) => {
    setError(null);
    try {
      await register(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Registration failed. Try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Intelligent Gambler today</Text>
        </View>

        <View style={styles.card}>
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Sign in</Text>
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
    paddingTop: 60,
    backgroundColor: COLORS.background,
  },
  header: { marginBottom: 32 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: COLORS.textMuted, fontSize: 15, marginTop: 6 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginLink: { marginTop: 24, alignItems: 'center' },
  loginText: { color: COLORS.textMuted, fontSize: 14 },
});
