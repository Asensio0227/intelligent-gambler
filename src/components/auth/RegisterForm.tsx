import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { IRegisterPayload } from '@/types/auth.types';
import { COLORS } from '@/constants/colors';

interface Props {
  onSubmit: (data: IRegisterPayload) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const RegisterForm: React.FC<Props> = ({ onSubmit, isLoading, error }) => {
  const [form, setForm] = useState<IRegisterPayload>({
    name: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (key: keyof IRegisterPayload, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (form.password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    setValidationError('');
    await onSubmit(form);
  };

  const displayError = validationError || error;

  return (
    <View style={styles.container}>
      {displayError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      )}
      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            value={form.name}
            onChangeText={(v) => update('name', v)}
            placeholder="John"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            value={form.lastName}
            onChangeText={(v) => update('lastName', v)}
            placeholder="Doe"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={form.email}
          onChangeText={(v) => update('email', v)}
          placeholder="you@example.com"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            value={form.password}
            onChangeText={(v) => update('password', v)}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={!showConfirm}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        style={[styles.btn, isLoading && { opacity: 0.6 }]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Create Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  errorBox: { backgroundColor: '#450a0a', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 13 },
  row: { flexDirection: 'row', gap: 12 },
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeIcon: { fontSize: 16 },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
