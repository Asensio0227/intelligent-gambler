import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';

const STEPS = [
  {
    title: 'Email us',
    body: 'Send a request to skycodingjr@gmail.com.',
  },
  {
    title: 'Use the right subject line',
    body: 'Subject: "Intelligent Gambler Account Deletion Request".',
  },
  {
    title: 'Identify your account',
    body: 'Include the email address or phone number linked to your account.',
  },
];

const DELETED_ITEMS = [
  'Your user account and profile information',
  'Authentication credentials',
  'Device tokens and notification data',
  'Saved payment methods',
];

const RETAINED_ITEMS = [
  'Completed order and transaction records',
  'Payment and billing logs',
  'Records required for legal, accounting, or security compliance',
];

export default function DeleteAccountScreen() {
  const emailSupport = () => {
    Linking.openURL(
      'mailto:skycodingjr@gmail.com?subject=Intelligent%20Gambler%20Account%20Deletion%20Request'
    ).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Delete My Account" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Intelligent Gambler respects your right to control your personal
          data. Here's how to request deletion of your account.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Request Deletion</Text>
          {STEPS.map((step, i) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.emailBtn} onPress={emailSupport}>
            <Text style={styles.emailBtnText}>✉️ Email Account Deletion Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What Will Be Deleted</Text>
          {DELETED_ITEMS.map((item) => (
            <Text key={item} style={styles.listItem}>
              •  {item}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data That May Be Retained</Text>
          {RETAINED_ITEMS.map((item) => (
            <Text key={item} style={styles.listItem}>
              •  {item}
            </Text>
          ))}
          <Text style={styles.note}>
            Any retained data is securely stored and only kept for the
            minimum period required by law.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Processing Time</Text>
          <Text style={styles.sectionBody}>
            Account deletion requests are processed within 30 days.
          </Text>
        </View>

        <Text style={styles.footer}>© 2026 Intelligent Gambler. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  intro: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  stepBody: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  emailBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  emailBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  listItem: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  sectionBody: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  note: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  footer: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
