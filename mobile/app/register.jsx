import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';
import { registerUser } from '../src/services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [collegeCode, setCollegeCode] = useState(params.code || 'APEX-TECH');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!collegeCode.trim() || !username.trim() || !email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields including college code and password.');
      return;
    }

    setLoading(true);
    try {
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || username;
      const lastName = parts.slice(1).join(' ') || '';

      await registerUser({
        username: username.trim(),
        first_name: firstName,
        last_name: lastName,
        email: email.trim(),
        password,
        role: 'STUDENT',
        institution_code: collegeCode.trim().toUpperCase(),
      });

      setLoading(false);
      Alert.alert(
        'Registration Submitted',
        `Your account has been created in PENDING status for college [${collegeCode.toUpperCase()}]. Your College Administrator must approve your account before you can log in.`,
        [
          { text: 'Go to Sign In', onPress: () => router.push({ pathname: '/login', params: { code: collegeCode } }) }
        ]
      );
    } catch (err) {
      setLoading(false);
      const detail = err.response?.data?.institution_code || err.response?.data?.username || err.response?.data?.detail || 'Registration failed. Please check inputs.';
      Alert.alert('Registration Error', Array.isArray(detail) ? detail.join(' ') : String(detail));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Join Your Campus</Text>
        <Text style={styles.subtitle}>Register your Grievio account with institution approval</Text>
        
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            Notice: All registrations require verification by your College Administrator. Pending accounts cannot file grievances until approved.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>COLLEGE CODE *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. HARVARD or MIT-ENG"
              placeholderTextColor={COLORS.textMuted}
              value={collegeCode}
              onChangeText={setCollegeCode}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>USERNAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. jordan.m2024"
              placeholderTextColor={COLORS.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>FULL NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="Jordan Miller"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>COLLEGE EMAIL *</Text>
            <TextInput
              style={styles.input}
              placeholder="jordan@college.edu"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>STUDENT ROLL NUMBER / STAFF ID</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2025MECH042"
              placeholderTextColor={COLORS.textMuted}
              value={rollNumber}
              onChangeText={setRollNumber}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PASSWORD *</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleRegister} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Registration</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchLink} 
            onPress={() => router.push({ pathname: '/login', params: { code: collegeCode } })}
          >
            <Text style={styles.switchLinkText}>Already registered? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
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
    marginBottom: SPACING.sm,
  },
  noticeBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  noticeText: {
    fontSize: 11,
    color: '#92400e',
    lineHeight: 16,
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

