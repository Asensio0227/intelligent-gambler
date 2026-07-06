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

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Terms & Conditions" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last updated: July 6, 2026</Text>
        <Text style={styles.intro}>
          By downloading, accessing, or using Intelligent Gambler ("the
          App"), operated by Sky Coding ("we," "us," "our"), you agree to be
          bound by these Terms of Service. If you do not agree, do not use
          the App.
        </Text>

        <Section title="1. Acceptance of Terms">
          We may update these Terms at any time by posting a revised version.
          Continued use of the App after changes are posted constitutes
          acceptance of the revised Terms.
        </Section>

        <Section title="2. Eligibility">
          The App is intended for users aged 18 and older. By using the App
          you represent that you meet this requirement. We reserve the right
          to refuse or terminate service to anyone at our sole discretion.
        </Section>

        <Section title="3. Nature of the Service">
          The App provides AI-generated football predictions, statistics,
          confidence scores, and related content for informational and
          entertainment purposes only. Nothing in the App constitutes
          financial, betting, or investment advice, or a guarantee of any
          outcome. Predictions may be incorrect, outdated, or incomplete. You
          are solely responsible for any decisions or wagers you make based
          on App content. We are not a licensed bookmaker, gambling
          operator, or financial services provider, and the App does not
          facilitate real-money wagering.
        </Section>

        <Section title="4. No Warranties">
          The App and all content are provided "as is" and "as available,"
          without warranties of any kind. We do not warrant that predictions
          will be accurate or that the App will meet your expectations.
        </Section>

        <Section title="5. Limitation of Liability">
          To the maximum extent permitted by law, Sky Coding and its owners,
          employees, and affiliates are not liable for indirect, incidental,
          special, consequential, or punitive damages arising from your use
          of the App. Our total aggregate liability shall not exceed the
          greater of the amount you paid us in the three months preceding a
          claim, or ZAR 100.
        </Section>

        <Section title="6. Subscriptions, Credits, and Payments">
          Certain features require a paid subscription or purchased credits,
          processed via Stripe. All fees are non-refundable except where
          required by law. We may change pricing, features, or discontinue
          plans at any time with notice through the App.
        </Section>

        <Section title="7. User Conduct">
          You agree not to reverse-engineer or attempt to extract source code
          or models from the App, use automated means to access the App,
          misuse or resell App content commercially, or use the App for any
          unlawful purpose. We may suspend or terminate your account for any
          violation of these Terms.
        </Section>

        <Section title="8. Indemnification">
          You agree to indemnify and hold harmless Sky Coding and its owners,
          employees, and affiliates from claims arising from your use of the
          App, your violation of these Terms, or any wagers or financial
          decisions you make based on App content.
        </Section>

        <Section title="9. Third-Party Services and Data">
          The App may display data sourced from third-party football data
          providers. We do not control and are not responsible for the
          accuracy, availability, or content of third-party data.
        </Section>

        <Section title="10. Intellectual Property">
          All App content, code, design, branding, and underlying prediction
          models are the exclusive property of Sky Coding. You are granted
          only a limited, revocable, non-transferable right to use the App
          for personal, non-commercial purposes.
        </Section>

        <Section title="11. Termination">
          We may suspend or terminate your access to the App at any time,
          with or without cause or notice.
        </Section>

        <Section title="12. Governing Law and Dispute Resolution">
          These Terms are governed by the laws of the Republic of South
          Africa. Disputes will first be attempted to be resolved informally
          by contacting us. Unresolved disputes will be submitted to
          arbitration under the rules of the Arbitration Foundation of
          Southern Africa (AFSA). You waive any right to participate in a
          class action against us.
        </Section>

        <Section title="13. Severability and Entire Agreement">
          If any provision of these Terms is found unenforceable, the
          remaining provisions remain in full force. These Terms constitute
          the entire agreement between you and Sky Coding regarding the App.
        </Section>

        <Section title="14. Contact">
          Questions about these Terms: skycodingjr@gmail.com
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
