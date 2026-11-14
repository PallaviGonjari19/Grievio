import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';
import { fetchComplaints, updateComplaintStatus } from '../src/services/api';

export default function StaffScreen() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Error loading mobile staff complaints:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleClaimTicket = async (complaintId) => {
    try {
      await updateComplaintStatus(complaintId, { status: 'IN_PROGRESS' });
      Alert.alert('Ticket Claimed', 'You have marked this complaint In Progress.');
      loadData();
    } catch (err) {
      Alert.alert('Action Failed', 'Could not claim ticket.');
    }
  };

  const renderComplaintItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/complaint_detail', params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.ticketNumber}>{item.ticket_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: COLORS.warning + '20' }]}>
          <Text style={[styles.statusText, { color: COLORS.warning }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      
      <View style={styles.metaRow}>
        <Text style={styles.deptText}>{item.department_name}</Text>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.categoryText}>{item.category_name}</Text>
        <Text style={styles.bullet}>•</Text>
        <Text style={[styles.priorityText, { color: item.priority === 'CRITICAL' ? COLORS.danger : COLORS.textMuted }]}>
          {item.priority}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.studentName}>
          From: {item.student_name || 'Student'}
        </Text>
        <View style={styles.actionRow}>
          {item.status === 'SUBMITTED' && (
            <TouchableOpacity
              style={styles.claimBtn}
              onPress={() => handleClaimTicket(item.id)}
            >
              <Text style={styles.claimBtnText}>Claim</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.viewLink}>Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Banner */}
        <View style={styles.banner}>
          <View>
            <Text style={styles.welcomeTitle}>Department Workbench</Text>
            <Text style={styles.welcomeSub}>Technician grievance queue</Text>
          </View>
          <View style={styles.queueBadge}>
            <Text style={styles.queueText}>{complaints.length} Tickets</Text>
          </View>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading queue...</Text>
          </View>
        ) : complaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Queue is Clear</Text>
            <Text style={styles.emptySub}>
              No complaints currently assigned to your department.
            </Text>
          </View>
        ) : (
          <FlatList
            data={complaints}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderComplaintItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  welcomeSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  queueBadge: {
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
  },
  queueText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  listContent: {
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketNumber: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deptText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bullet: {
    marginHorizontal: 4,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  studentName: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  claimBtn: {
    backgroundColor: COLORS.primary + '15',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  claimBtnText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  viewLink: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
