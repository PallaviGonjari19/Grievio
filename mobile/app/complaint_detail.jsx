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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../src/constants/theme';
import { 
  fetchComplaintDetail, 
  updateComplaintStatus, 
  addComplaintComment 
} from '../src/services/api';

export default function ComplaintDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      const data = await fetchComplaintDetail(id);
      setComplaint(data);
    } catch (err) {
      console.error('Failed to load complaint detail:', err);
      Alert.alert('Error', 'Unable to retrieve complaint record.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (targetStatus, notes = '', reopenReason = '') => {
    setActionLoading(true);
    try {
      await updateComplaintStatus(id, {
        status: targetStatus,
        resolution_notes: notes,
        reopen_reason: reopenReason,
      });
      Alert.alert('Status Updated', `Ticket marked as ${targetStatus}.`);
      loadDetail();
    } catch (err) {
      const detail = err.response?.data?.error || err.response?.data?.detail || 'Failed to update status.';
      Alert.alert('Action Failed', String(detail));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;

    setCommenting(true);
    try {
      await addComplaintComment(id, commentText.trim(), false);
      setCommentText('');
      loadDetail();
    } catch (err) {
      Alert.alert('Comment Failed', 'Could not post message.');
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading complaint #{id}...</Text>
      </SafeAreaView>
    );
  }

  if (!complaint) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.emptyText}>Complaint record not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.ticketNumber}>{complaint.ticket_number}</Text>
            <View style={styles.badgeGroup}>
              <View style={[styles.badge, { backgroundColor: COLORS.warning + '20' }]}>
                <Text style={[styles.badgeText, { color: COLORS.warning }]}>
                  {complaint.status}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: COLORS.textMuted + '20' }]}>
                <Text style={[styles.badgeText, { color: COLORS.text }]}>
                  {complaint.priority}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>{complaint.title}</Text>
          <Text style={styles.metaText}>
            {complaint.department_name} • {complaint.category_name}
          </Text>
          {complaint.location_name && (
            <Text style={styles.locationText}>
              📍 {complaint.location_name} {complaint.location_details ? `(${complaint.location_details})` : ''}
            </Text>
          )}
          <Text style={styles.reporterText}>
            Reported by: {complaint.student_name || 'Student'} • {new Date(complaint.created_at).toLocaleString()}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          <Text style={styles.descriptionText}>{complaint.description}</Text>
        </View>

        {/* Resolution Notes Callout */}
        {complaint.resolution_notes && (
          <View style={[styles.sectionCard, styles.resolvedCard]}>
            <Text style={styles.resolvedTitle}>✓ Technician Resolution Summary</Text>
            <Text style={styles.resolvedNotes}>{complaint.resolution_notes}</Text>
          </View>
        )}

        {/* Reopen Callout */}
        {complaint.status === 'REOPENED' && complaint.reopen_reason && (
          <View style={[styles.sectionCard, styles.reopenCard]}>
            <Text style={styles.reopenTitle}>⚠️ Reopened by Student</Text>
            <Text style={styles.reopenNotes}>Reason: {complaint.reopen_reason}</Text>
          </View>
        )}

        {/* Action Controls for Resolved Complaints */}
        {complaint.status === 'RESOLVED' && (
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Review Maintenance Work</Text>
            <Text style={styles.actionSubtitle}>
              Please verify if the issue has been resolved satisfactorily.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.confirmBtn]}
                onPress={() => handleStatusChange('CLOSED', '', '')}
                disabled={actionLoading}
              >
                <Text style={styles.btnText}>Confirm & Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.disputeBtn]}
                onPress={() => {
                  Alert.prompt
                    ? Alert.prompt(
                        'Reopen Grievance',
                        'Please specify why the repair was incomplete:',
                        (reason) => handleStatusChange('REOPENED', '', reason)
                      )
                    : handleStatusChange('REOPENED', '', 'Issue persists upon student inspection');
                }}
                disabled={actionLoading}
              >
                <Text style={styles.disputeBtnText}>Dispute / Reopen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Staff Quick Status Update */}
        {['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS'].includes(complaint.status) && (
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Technician Workflow Controls</Text>
            <View style={styles.statusRow}>
              {complaint.status !== 'IN_PROGRESS' && (
                <TouchableOpacity
                  style={[styles.btn, styles.workBtn]}
                  onPress={() => handleStatusChange('IN_PROGRESS')}
                  disabled={actionLoading}
                >
                  <Text style={styles.btnText}>Start Work</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.btn, styles.resolveBtn]}
                onPress={() => handleStatusChange('RESOLVED', 'Maintenance work executed and checked.')}
                disabled={actionLoading}
              >
                <Text style={styles.btnText}>Mark Resolved</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AUDIT TIMELINE</Text>
          {complaint.timeline && complaint.timeline.length > 0 ? (
            complaint.timeline.map((item, idx) => (
              <View key={item.id || idx} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineAction}>{item.action}</Text>
                  {item.notes ? <Text style={styles.timelineNotes}>{item.notes}</Text> : null}
                  <Text style={styles.timelineMeta}>
                    By {item.actor_name || 'System'} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptySub}>No audit events recorded.</Text>
          )}
        </View>

        {/* Comments Stream */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>COMMUNICATION THREAD ({complaint.comments?.length || 0})</Text>
          {complaint.comments && complaint.comments.length > 0 ? (
            complaint.comments.map((c) => (
              <View key={c.id} style={styles.commentBox}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{c.author_name}</Text>
                  <Text style={styles.commentRole}>{c.author_role}</Text>
                </View>
                <Text style={styles.commentBody}>{c.message}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptySub}>No comments yet.</Text>
          )}

          {/* Add Comment Input */}
          <View style={styles.addCommentRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Send message to technician..."
              placeholderTextColor={COLORS.textMuted}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handlePostComment}
              disabled={commenting || !commentText.trim()}
            >
              {commenting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.sendBtnText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
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
    padding: SPACING.md,
    gap: SPACING.md,
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
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: COLORS.primary,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.text,
    marginBottom: 4,
  },
  reporterText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  resolvedCard: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success + '30',
  },
  resolvedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  resolvedNotes: {
    fontSize: 12,
    color: COLORS.text,
  },
  reopenCard: {
    backgroundColor: COLORS.danger + '10',
    borderColor: COLORS.danger + '30',
  },
  reopenTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  reopenNotes: {
    fontSize: 12,
    color: COLORS.text,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: COLORS.success,
  },
  disputeBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  workBtn: {
    backgroundColor: COLORS.primary,
  },
  resolveBtn: {
    backgroundColor: COLORS.success,
  },
  btnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  disputeBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: RADIUS.md,
  },
  timelineAction: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  timelineNotes: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timelineMeta: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  commentBox: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  commentRole: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  commentBody: {
    fontSize: 12,
    color: COLORS.text,
  },
  addCommentRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.text,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  sendBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
