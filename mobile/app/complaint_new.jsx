import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';
import { fetchDepartments, fetchCategories, fetchLocations, createComplaint } from '../src/services/api';

export default function NewComplaintScreen() {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [depts, locs] = await Promise.all([
        fetchDepartments(),
        fetchLocations()
      ]);
      setDepartments(depts);
      setLocations(locs);
      if (depts.length > 0) {
        setDepartment(String(depts[0].id));
        loadCategories(depts[0].id);
      }
    } catch (err) {
      console.error('Error loading complaint metadata:', err);
      Alert.alert('Network Error', 'Failed to load campus departments.');
    } finally {
      setLoadingMeta(false);
    }
  };

  const loadCategories = async (deptId) => {
    try {
      const cats = await fetchCategories(deptId);
      setCategories(cats);
      if (cats.length > 0) {
        setCategory(String(cats[0].id));
      } else {
        setCategory('');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSelectDepartment = (deptId) => {
    setDepartment(String(deptId));
    loadCategories(deptId);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please enter a title and detailed description.');
      return;
    }
    if (!department || !category) {
      Alert.alert('Selection Required', 'Please select a department and category.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        department: parseInt(department, 10),
        category: parseInt(category, 10),
        priority,
      };
      if (location) {
        payload.location = parseInt(location, 10);
      }
      if (locationDetails.trim()) {
        payload.location_details = locationDetails.trim();
      }

      const res = await createComplaint(payload);
      Alert.alert(
        'Grievance Filed',
        `Ticket #${res.ticket_number} has been logged successfully! Our technicians have been notified.`,
        [{ text: 'OK', onPress: () => router.replace('/student') }]
      );
    } catch (err) {
      console.error('Failed to submit grievance:', err);
      const detail = err.response?.data?.detail || err.response?.data?.error || 'Unable to submit grievance.';
      Alert.alert('Submission Error', String(detail));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMeta) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading campus options...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Raise Campus Grievance</Text>
        <Text style={styles.subheading}>Describe the issue with location and priority details</Text>

        <View style={styles.form}>
          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>ISSUE TITLE *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Broken bench in Room 204"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Department Selection */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>TARGET DEPARTMENT *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              {departments.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.pill, department === String(d.id) && styles.pillActive]}
                  onPress={() => handleSelectDepartment(d.id)}
                >
                  <Text style={[styles.pillText, department === String(d.id) && styles.pillTextActive]}>
                    {d.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category Selection */}
          {categories.length > 0 && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CATEGORY *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.pill, category === String(c.id) && styles.pillActive]}
                    onPress={() => setCategory(String(c.id))}
                  >
                    <Text style={[styles.pillText, category === String(c.id) && styles.pillTextActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Priority */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PRIORITY / SEVERITY</Text>
            <View style={styles.priorityRow}>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityBtn, priority === p && styles.priorityBtnActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.priorityBtnText, priority === p && styles.priorityBtnTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          {locations.length > 0 && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CAMPUS BUILDING / BLOCK</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                {locations.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.pill, location === String(l.id) && styles.pillActive]}
                    onPress={() => setLocation(String(l.id))}
                  >
                    <Text style={[styles.pillText, location === String(l.id) && styles.pillTextActive]}>
                      {l.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Location Details */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>ROOM / SPECIFIC LANDMARK</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2nd Floor, Desk #4"
              placeholderTextColor={COLORS.textMuted}
              value={locationDetails}
              onChangeText={setLocationDetails}
            />
          </View>

          {/* Detailed Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>DETAILED DESCRIPTION *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Explain the problem in detail so our maintenance technicians can bring the right tools..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Submit Grievance</Text>
            )}
          </TouchableOpacity>
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
    padding: SPACING.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  form: {
    gap: SPACING.md,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.text,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  pillRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  pill: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  pillTextActive: {
    color: COLORS.white,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  priorityBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priorityBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },
  priorityBtnTextActive: {
    color: COLORS.white,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
