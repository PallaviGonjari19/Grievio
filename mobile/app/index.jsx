import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';
import { checkHealth } from '../src/services/api';

export default function WelcomeScreen() {
  const router = useRouter();
  const [institutionCode, setInstitutionCode] = useState('');
  const [systemOnline, setSystemOnline] = useState(false);

  useEffect(() => {
    checkHealth().then((res) => {
      setSystemOnline(res.ok);
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Badge */}
        <View style={styles.badgeRow}>
          <View style={[styles.statusDot, { backgroundColor: systemOnline ? COLORS.success : COLORS.warning }]} />
          <Text style={styles.badgeText}>
            {systemOnline ? 'API Connected • Multi-Tenant' : 'Grievio Mobile Core Active'}
          </Text>
        </View>

        {/* Hero Branding */}
        <View style={styles.heroSection}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoLetter}>G</Text>
          </View>
          <Text style={styles.brandTitle}>Grievio</Text>
          <Text style={styles.tagline}>Every concern deserves a resolution.</Text>
          <Text style={styles.subtitle}>
            Campus grievance & maintenance management platform for students, staff, and leadership.
          </Text>
        </View>

        {/* College Code Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>QUICK COLLEGE ACCESS</Text>
          <TextInput
            style={styles.input}
            placeholder="ENTER INSTITUTION CODE (e.g. MIT-ENG)"
            placeholderTextColor={COLORS.textMuted}
            value={institutionCode}
            onChangeText={(text) => setInstitutionCode(text.toUpperCase())}
            autoCapitalize="characters"
          />
          <Text style={styles.inputHint}>
            Your college provides a unique code to access campus facilities and departmental queues.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push({ pathname: '/login', params: { role: 'student', code: institutionCode } })}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Student Portal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push({ pathname: '/login', params: { role: 'staff', code: institutionCode } })}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Staff & Technician Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryBtn}
            onPress={() => router.push({ pathname: '/register', params: { code: institutionCode } })}
            activeOpacity={0.7}
          >
            <Text style={styles.tertiaryBtnText}>First time? Register with College Code</Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Protected by multi-tenant row isolation & role-based security.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs + 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoLetter: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 18,
    maxWidth: 290,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs + 2,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    fontSize: 13,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    lineHeight: 15,
  },
  actions: {
    width: '100%',
    gap: SPACING.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  tertiaryBtn: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  tertiaryBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

