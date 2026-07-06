import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/shared/Header';
import { COLORS } from '@/constants/colors';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionBody}>{children}</Text>
  </View>
);

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Privacy Policy" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last updated: July 6, 2026</Text>
        <Text style={styles.intro}>
          This Privacy Policy explains how Sky Coding ("we," "us," "our")
          collects, uses, and protects information when you use Intelligent
          Gambler ("the App"), in accordance with Zimbabwe's Cyber and Data
          Protection Act [Chapter 11:12].
        </Text>

        <Section title="1. Information We Collect">
          Account information: name, email address, password (hashed), and
          role.{'\n\n'}
          Usage data: predictions viewed, tickets created, app interactions,
          device identifiers, push notification tokens.{'\n\n'}
          Payment information: processed directly by Stripe; we do not store
          full card numbers. We retain subscription status and transaction
          metadata only.{'\n\n'}
          Technical data: IP address, device type, OS version, crash logs,
          collected automatically for app functionality and diagnostics.
        </Section>

        <Section title="2. How We Use Information">
          We use collected information to: operate and maintain the App;
          process payments and subscriptions; send push notifications you
          have opted into; monitor and improve app performance; detect fraud
          or abuse; and comply with legal obligations. We do not sell your
          personal information to third parties.
        </Section>

        <Section title="3. Legal Basis for Processing">
          We process your information on the basis of: your consent (where
          given); performance of our contract with you (these Terms); and our
          legitimate business interests in operating and securing the App, to
          the extent consistent with Zimbabwe's Cyber and Data Protection Act.
        </Section>

        <Section title="4. Data Sharing">
          We share information only with: service providers who help us
          operate the App (e.g., Stripe for payments, Firebase/push
          notification providers, hosting providers); and where required by
          law, regulation, or valid legal process. We require these providers
          to protect your data and use it only for the services they provide
          us.
        </Section>

        <Section title="5. Data Retention">
          We retain personal information for as long as your account is
          active or as needed to provide the App, comply with legal
          obligations, resolve disputes, and enforce our agreements. You may
          request deletion of your account and associated data at any time,
          subject to any records we are legally required to retain.
        </Section>

        <Section title="6. Your Rights">
          Subject to Zimbabwe's Cyber and Data Protection Act, you have the
          right to: access the personal information we hold about you;
          request correction or deletion of your information; object to
          processing in certain circumstances; and lodge a complaint with
          the Postal and Telecommunications Regulatory Authority of Zimbabwe
          (POTRAZ), Zimbabwe's data protection authority. To exercise these
          rights, contact us at skycodingjr@gmail.com. We may require proof
          of identity before acting on a request and may decline requests
          where we have a legitimate legal basis to retain information.
        </Section>

        <Section title="7. Security">
          We take reasonable technical and organizational measures to protect
          your information. However, no method of transmission or storage is
          100% secure, and we cannot guarantee absolute security.
        </Section>

        <Section title="8. Children's Privacy">
          The App is not intended for individuals under 18. We do not
          knowingly collect information from minors. If we become aware that
          we have collected such information, we will delete it.
        </Section>

        <Section title="9. Changes to This Policy">
          We may update this Privacy Policy at any time by posting the
          revised version in the App or Legal Center. Continued use of the
          App after changes constitutes acceptance.
        </Section>

        <Section title="10. Contact">
          Questions or requests regarding this Privacy Policy or your data:
          skycodingjr@gmail.com
        </Section>

        <Text style={styles.footer}>© 2026 Intelligent Gambler. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  updated: { color: COLORS.textMuted, fontSize: 12, marginBottom: 12 },
  intro: { color: COLORS.text, fontSize: 14, lineHeight: 20, marginBottom: 20 },
  section: { marginBottom: 18 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionBody: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  footer: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
});
