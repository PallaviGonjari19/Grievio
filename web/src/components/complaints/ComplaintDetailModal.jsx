import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Building2, 
  MapPin, 
  FileText, 
  MessageSquare, 
  Send, 
  Upload, 
  ShieldCheck, 
  History, 
  ArrowRight,
  ExternalLink,
  Loader2,
  Lock,
  RotateCcw
} from 'lucide-react';

export default function ComplaintDetailModal({ complaintId, isOpen, onClose, onUpdated }) {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Status transition state
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  
  // Resolution proof upload state
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Comments state
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Image preview modal
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (isOpen && complaintId) {
      loadComplaintData();
    }
  }, [isOpen, complaintId]);

  const loadComplaintData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await apiClient.get(`/complaints/${complaintId}/`);
      const data = res.data;
      setComplaint(data);
      setNewStatus(data.status);
      setResolutionNotes(data.resolution_notes || '');
      setAssignedStaffId(data.assigned_staff || '');

      // If user is Staff or Admin, load available department staff for assignment
      if (['STAFF', 'ADMIN', 'SUPERADMIN'].includes(user?.role) && data.department) {
        try {
          const staffRes = await apiClient.get(`/accounts/staff/?department=${data.department}`);
          setDepartmentStaff(staffRes.data.results || staffRes.data);
        } catch (e) {
          console.error('Failed to load staff list:', e);
        }
      }
    } catch (err) {
      console.error('Error loading complaint detail:', err);
      setErrorMessage('Failed to load complaint information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (targetStatus, notes = '') => {
    setStatusUpdating(true);
    setErrorMessage('');
    try {
      const payload = {
        status: targetStatus || newStatus,
        resolution_notes: notes || resolutionNotes,
        reopen_reason: reopenReason,
      };

      if (['ADMIN', 'STAFF', 'SUPERADMIN'].includes(user?.role) && assignedStaffId !== undefined) {
        payload.assigned_staff_id = assignedStaffId;
      }

      const res = await apiClient.patch(`/complaints/${complaintId}/status/`, payload);
      setComplaint(res.data);
      setNewStatus(res.data.status);
      setReopenReason('');
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      console.error('Status update failed:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to update ticket status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleUploadResolutionProof = async (e) => {
    e.preventDefault();
    if (!proofFile) return;

    setUploadingProof(true);
    setErrorMessage('');
    try {
      const form = new FormData();
      form.append('file', proofFile);
      form.append('is_resolution_proof', 'true');

      await apiClient.post(`/complaints/${complaintId}/attachments/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProofFile(null);
      setProofPreview(null);
      await loadComplaintData();
    } catch (err) {
      console.error('Failed to upload proof:', err);
      setErrorMessage('Failed to upload resolution proof image.');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    setErrorMessage('');
    try {
      await apiClient.post(`/complaints/${complaintId}/comments/`, {
        message: newComment.trim(),
        is_internal: isInternalComment
      });

      setNewComment('');
      setIsInternalComment(false);
      await loadComplaintData();
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isStudent = user?.role === 'STUDENT';
  const isStaffOrAdmin = ['STAFF', 'ADMIN', 'SUPERADMIN'].includes(user?.role);

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ASSIGNED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ACKNOWLEDGED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'REOPENED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200/90 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {complaint?.ticket_number || 'Loading...'}
            </span>
            {complaint && (
              <>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
              <span className="text-xs">Loading grievance history and telemetry...</span>
            </div>
          ) : complaint ? (
            <>
              {/* Title & Core Meta */}
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-slate-900 leading-snug">
                  {complaint.title}
                </h1>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{complaint.department_name} • {complaint.category_name}</span>
                  </div>
                  {complaint.location_name && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{complaint.location_name} {complaint.location_details ? `(${complaint.location_details})` : ''}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reported by: <span className="font-semibold text-slate-700">{complaint.student_name || 'Student'}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(complaint.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Description Box */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Detailed Description
                </span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Photos & Evidence Gallery */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Attached Evidence & Photos ({complaint.attachments.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {complaint.attachments.map((att) => (
                      <div
                        key={att.id}
                        onClick={() => setPreviewImage(att.file)}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-pointer hover:shadow-md transition"
                      >
                        <img
                          src={att.file}
                          alt="Grievance Evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[10px] font-semibold text-white">
                            {att.is_resolution_proof ? '✓ Resolution Proof' : 'Initial Photo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reopen Reason Callout (if reopened) */}
              {complaint.status === 'REOPENED' && complaint.reopen_reason && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>Grievance Reopened by Student</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    Reason: "{complaint.reopen_reason}"
                  </p>
                </div>
              )}

              {/* Resolution Notes Callout (if resolved or closed) */}
              {['RESOLVED', 'CLOSED'].includes(complaint.status) && complaint.resolution_notes && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Technician Resolution Notes</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    "{complaint.resolution_notes}"
                  </p>
                </div>
              )}

              {/* Student Resolution Confirmation / Dispute Banner */}
              {isStudent && complaint.status === 'RESOLVED' && (
                <div className="p-5 rounded-2xl bg-brand-50 border border-brand-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-brand-900">
                        Technician Marked This Grievance as Resolved
                      </h4>
                      <p className="text-xs text-brand-700 mt-0.5">
                        Please inspect the facility. If the maintenance was performed satisfactorily, confirm resolution to close the ticket. If the problem persists, you may dispute and reopen it.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => handleStatusUpdate('CLOSED')}
                      disabled={statusUpdating}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Satisfaction & Close
                    </button>

                    <button
                      onClick={() => {
                        const reason = prompt('Please describe why the issue remains unresolved:');
                        if (reason && reason.trim()) {
                          setReopenReason(reason.trim());
                          handleStatusUpdate('REOPENED', '');
                        }
                      }}
                      disabled={statusUpdating}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                      Dispute & Reopen Issue
                    </button>
                  </div>
                </div>
              )}

              {/* Staff / Admin Operations Workbench */}
              {isStaffOrAdmin && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                      Technician & Department Action Center
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Assigned: <span className="font-semibold text-slate-700">{complaint.assigned_staff_name || 'Unassigned'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Update Lifecycle Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none bg-white font-medium text-slate-800"
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="ACKNOWLEDGED">Acknowledged (In Triage)</option>
                        <option value="ASSIGNED">Assigned to Staff</option>
                        <option value="IN_PROGRESS">In Progress (Work Underway)</option>
                        <option value="RESOLVED">Resolved (Work Completed)</option>
                        <option value="REJECTED">Rejected (Invalid / Duplicate)</option>
                        {user.role === 'ADMIN' && <option value="CLOSED">Closed (Administrative Override)</option>}
                      </select>
                    </div>

                    {/* Staff Assignment */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Assign Technician
                      </label>
                      <select
                        value={assignedStaffId || ''}
                        onChange={(e) => setAssignedStaffId(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none bg-white font-medium text-slate-800"
                      >
                        <option value="">Unassigned</option>
                        {departmentStaff.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.first_name} {st.last_name} ({st.username})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Resolution Notes (if resolving) */}
                  {newStatus === 'RESOLVED' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Resolution Summary & Maintenance Notes <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Detail the repairs completed, parts replaced, or diagnostic results..."
                        rows={3}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none font-medium text-slate-800"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Resolution Proof Upload */}
                    <form onSubmit={handleUploadResolutionProof} className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition">
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>{proofFile ? proofFile.name.slice(0, 15) + '...' : 'Upload Proof Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProofFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {proofFile && (
                        <button
                          type="submit"
                          disabled={uploadingProof}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition disabled:opacity-50"
                        >
                          {uploadingProof ? 'Uploading...' : 'Save Proof'}
                        </button>
                      )}
                    </form>

                    {/* Commit Status Change */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate()}
                      disabled={statusUpdating}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-60"
                    >
                      {statusUpdating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Apply Status & Assignment'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Audit Timeline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <History className="w-4 h-4 text-brand-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Grievance Audit History
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {complaint.timeline && complaint.timeline.length > 0 ? (
                    complaint.timeline.map((event, idx) => (
                      <div key={event.id || idx} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                        <div className="flex-1 bg-slate-50/60 rounded-xl p-2.5 border border-slate-200/60">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{event.action}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {event.notes && (
                            <p className="text-slate-600 text-[11px] mt-0.5">{event.notes}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            By {event.actor_name || 'System'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No timeline entries recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Comments & Discussion Stream */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Communication Thread ({complaint.comments?.length || 0})
                    </h3>
                  </div>
                </div>

                {/* Comment Cards */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {complaint.comments && complaint.comments.length > 0 ? (
                    complaint.comments.map((cmt) => (
                      <div
                        key={cmt.id}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                          cmt.is_internal
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{cmt.author_name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">
                              {cmt.author_role}
                            </span>
                            {cmt.is_internal && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Staff Internal
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(cmt.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{cmt.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No comments yet. Send a message to communicate with technicians.
                    </div>
                  )}
                </div>

                {/* Add Comment Box */}
                <form onSubmit={handleAddComment} className="pt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type a message or inquiry..."
                      className="flex-1 text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={commentSubmitting || !newComment.trim()}
                      className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {commentSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Send
                    </button>
                  </div>

                  {isStaffOrAdmin && (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>Mark as internal staff note (hidden from student)</span>
                    </label>
                  )}
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Full-size Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
