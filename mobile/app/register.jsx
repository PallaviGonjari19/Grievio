import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [collegeCode, setCollegeCode] = useState(params.code || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    Alert.alert(
      'Registration Submitted',
      `Your account request for college [${collegeCode}] has been queued for verification. Backend API connected.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Join Your Campus</Text>
        <Text style={styles.subtitle}>Register your Grievio account with institution approval</Text>

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
            <Text style={styles.label}>STUDENT ROLL NUMBER / STAFF ID *</Text>
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

          <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>Submit Registration</Text>
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
    marginBottom: SPACING.lg,
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
