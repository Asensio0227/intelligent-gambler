import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';

const SOCIALS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: '💬',
    value: '+263 78 697 4895',
    url: 'https://wa.me/263786974895',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: '📷',
    value: '@skycodingjr',
    url: 'https://www.instagram.com/skycodingjr/',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: '📘',
    value: 'Sky Coding',
    url: 'https://www.facebook.com/people/sky-coding/61569101216140/',
  },
  {
    key: 'email',
    label: 'Email',
    icon: '✉️',
    value: 'skycodingjr@gmail.com',
    url: 'mailto:skycodingjr@gmail.com',
  },
];

const LEGAL_LINKS = [
  { key: 'privacy', label: 'Privacy Policy', icon: '🔒', route: '/legal/privacy' },
  { key: 'terms', label: 'Terms & Conditions', icon: '📄', route: '/legal/terms' },
  { key: 'delete', label: 'Delete My Account', icon: '🗑️', route: '/legal/delete-account' },
];

export default function AboutLegalScreen() {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="About & Legal" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {/* About */}
        <View style={styles.card}>
          <Text style={styles.appName}>Intelligent Gambler</Text>
          <Text style={styles.appTagline}>
            AI-powered football predictions, fixture tracking, and ticket
            management — built by Sky Coding.
          </Text>
          <Text style={styles.aboutBody}>
            Intelligent Gambler brings together live fixtures, AI-generated
            prediction insights, and easy ticket creation in one app. Our goal
            is to give you clear, data-driven football information for
            informational and entertainment purposes.
          </Text>
        </View>

        {/* Social links */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connect With Us</Text>
          {SOCIALS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={styles.row}
              onPress={() => openLink(s.url)}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>{s.icon}</Text>
                <View>
                  <Text style={styles.rowLabel}>{s.label}</Text>
                  <Text style={styles.rowValue}>{s.value}</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal links */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal</Text>
          {LEGAL_LINKS.map((l) => (
            <TouchableOpacity
              key={l.key}
              style={styles.row}
              onPress={() => router.push(l.route as never)}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>{l.icon}</Text>
                <Text style={styles.rowLabel}>{l.label}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>© 2026 Intelligent Gambler. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  appName: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  appTagline: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  aboutBody: { color: COLORS.text, fontSize: 14, lineHeight: 20, marginTop: 4 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { fontSize: 20 },
  rowLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  rowValue: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { color: COLORS.textMuted, fontSize: 20 },
  footer: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
