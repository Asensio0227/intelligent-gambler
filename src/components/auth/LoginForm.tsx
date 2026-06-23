import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginForm: React.FC<Props> = ({ onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          style={styles.input}
        />
      </View>
      <TouchableOpacity
        onPress={() => onSubmit(email, password)}
        disabled={isLoading}
        style={[styles.btn, isLoading && { opacity: 0.6 }]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  errorBox: { backgroundColor: '#450a0a', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 13 },
  field: { gap: 6 },
  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
