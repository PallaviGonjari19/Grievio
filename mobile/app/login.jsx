import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [role, setRole] = useState(params.role || 'student');
  const [code, setCode] = useState(params.code || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    Alert.alert(
      'Phase 1 Prototype',
      `Mobile API Client configured for /api/v1/accounts/token/. Active role: ${role.toUpperCase()}. Full credential flow will be unlocked in Phase 2.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sign In to Grievio</Text>
        <Text style={styles.subtitle}>Enter your verified college credentials</Text>

        {/* Role Segment Control */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, role === 'student' && styles.segmentBtnActive]}
            onPress={() => setRole('student')}
          >
            <Text style={[styles.segmentText, role === 'student' && styles.segmentTextActive]}>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, role === 'staff' && styles.segmentBtnActive]}
            onPress={() => setRole('staff')}
          >
            <Text style={[styles.segmentText, role === 'staff' && styles.segmentTextActive]}>Staff</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>COLLEGE CODE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. MIT-ENG"
              placeholderTextColor={COLORS.textMuted}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL OR ID</Text>
            <TextInput
              style={styles.input}
              placeholder="student@college.edu"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>Authenticate</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchLink} 
            onPress={() => router.push({ pathname: '/register', params: { code } })}
          >
            <Text style={styles.switchLinkText}>Need an account? Register with College Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.lg,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.card,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.text,
  },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    fontSize: 13,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  switchLink: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  switchLinkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
