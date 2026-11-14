import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  Search,
  Check,
  X,
  ChevronRight,
  Filter,
  UserCheck,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  // Complaint filtering & selection
  const [complaintFilterStatus, setComplaintFilterStatus] = useState('ALL');
  const [complaintFilterDept, setComplaintFilterDept] = useState('');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [pendingRes, deptsRes, compRes, metricsRes] = await Promise.all([
        apiClient.get('/accounts/pending-users/'),
        apiClient.get('/departments/'),
        apiClient.get('/complaints/'),
        apiClient.get('/reporting/metrics/').catch(() => ({ data: null }))
      ]);
      setPendingUsers(pendingRes.data.results || pendingRes.data);
      setDepartments(deptsRes.data.results || deptsRes.data);
      setComplaints(compRes.data.results || compRes.data);
      if (metricsRes.data) setMetrics(metricsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (userId, username) => {
    setActionLoadingId(userId);
    setFeedbackMsg('');
    try {
      await apiClient.post(`/accounts/users/${userId}/approve/`, { action: 'approve' });
      setFeedbackMsg(`✓ User ${username} successfully approved! They can now access Grievio.`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve registration.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (userId, username) => {
    const reason = window.prompt(`Enter reason for rejecting ${username}:`, 'Unverified credentials');
    if (reason === null) return;

    setActionLoadingId(userId);
    setFeedbackMsg('');
    try {
      await apiClient.post(`/accounts/users/${userId}/approve/`, { action: 'reject', reason });
      setFeedbackMsg(`✗ User ${username} rejected.`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject registration.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 flex items-center gap-1"><Check className="w-3 h-3" /> CLOSED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 flex items-center gap-1"><Clock className="w-3 h-3" /> IN PROGRESS</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">ASSIGNED</span>;
      case 'REOPENED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> REOPENED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">{status}</span>;
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (complaintFilterStatus === 'OPEN') {
      if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status)) return false;
    } else if (complaintFilterStatus === 'RESOLVED') {
      if (!['RESOLVED', 'CLOSED'].includes(c.status)) return false;
    }

    if (complaintFilterDept && String(c.department) !== String(complaintFilterDept)) {
      return false;
    }

    if (complaintSearch.trim()) {
      const q = complaintSearch.toLowerCase();
      const matchNum = c.ticket_number?.toLowerCase().includes(q);
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchStudent = c.student_name?.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchStudent) return false;
    }

    return true;
  });

  return (
    <DashboardLayout activeTab="overview" onSelectComplaint={(id) => setSelectedComplaintId(id)}>
      <div className="space-y-8">
        {/* Header Title Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 mb-1">
              <Building2 className="w-4 h-4" />
              <span>COLLEGE ADMINISTRATOR CONSOLE</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {user?.institution_name || 'Institution Workspace'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Campus Code: <span className="font-mono font-semibold text-slate-700">{user?.institution_code}</span> • Multi-tenant isolation active
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Console
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Registrations</span>
            <p className="text-2xl font-black text-amber-600">{pendingUsers.length}</p>
            <p className="text-[11px] text-slate-500">Awaiting college approval</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active & Overdue Tickets</span>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900">
                {complaints.filter((c) => ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(c.status)).length}
              </p>
              {complaints.filter((c) => c.is_overdue).length > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {complaints.filter((c) => c.is_overdue).length} Overdue
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Active maintenance queue</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SLA Compliance Rate</span>
            <p className="text-2xl font-black text-emerald-600">
              {metrics?.summary?.sla_compliance_percent ?? 100}%
            </p>
            <p className="text-[11px] text-slate-500">Turnaround within targets</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Resolution Time</span>
            <p className="text-2xl font-black text-brand-600">
              {metrics?.summary?.avg_turnaround_hours ?? 0}h
            </p>
            <p className="text-[11px] text-slate-500">From submission to fix</p>
          </div>
        </div>

        {/* SECTION 1: Pending Student & Staff Approval Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Registration Approval Queue</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {pendingUsers.length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Review and approve new student and staff applicants before they can file grievances or access department tools.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading registration queue...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">All Registrations Reviewed</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are no pending registrations waiting for your approval. New student signups will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-3">Applicant Name</th>
                    <th className="py-3 px-3">Username</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Requested Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingUsers.map((pending) => (
                    <tr key={pending.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        {pending.first_name ? `${pending.first_name} ${pending.last_name}` : 'Applicant'}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{pending.username}</td>
                      <td className="py-3.5 px-3 text-slate-600">{pending.email}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          pending.role === 'STAFF' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {pending.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(pending.id, pending.username)}
                            disabled={actionLoadingId === pending.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(pending.id, pending.username)}
                            disabled={actionLoadingId === pending.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 font-semibold text-[11px] transition disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 2: Master Grievance Management Center */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">Campus Grievance Dispatch & Overview</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700">
                  {complaints.length} Total Tickets
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monitor live complaints, reassign technicians, and inspect maintenance resolution proofs.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  placeholder="Search complaints..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-brand-500 outline-none w-44"
                />
              </div>

              <select
                value={complaintFilterDept}
                onChange={(e) => setComplaintFilterDept(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 outline-none bg-white font-medium text-slate-800"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setComplaintFilterStatus('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition ${complaintFilterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setComplaintFilterStatus('OPEN')}
                  className={`px-2.5 py-1 rounded-lg transition ${complaintFilterStatus === 'OPEN' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
                >
                  Open
                </button>
                <button
                  onClick={() => setComplaintFilterStatus('RESOLVED')}
                  className={`px-2.5 py-1 rounded-lg transition ${complaintFilterStatus === 'RESOLVED' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No Complaints Matching Criteria</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No tickets match the selected filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-3">Ticket #</th>
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assigned Staff</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedComplaintId(c.id)}
                      className="hover:bg-brand-50/30 cursor-pointer transition group"
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-brand-600">{c.ticket_number}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-900 group-hover:text-brand-700">
                        {c.title}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{c.department_name}</td>
                      <td className="py-3.5 px-3 text-slate-700">{c.student_name || 'Student'}</td>
                      <td className="py-3.5 px-3">{getPriorityBadge(c.priority)}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(c.status)}
                          {c.is_overdue && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 flex items-center gap-0.5">
                              ⚠️ SLA Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {c.assigned_staff_name || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-xs font-semibold text-brand-600 group-hover:underline inline-flex items-center gap-1">
                          Manage <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 3: Active Departments & SLAs */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Departments & SLA Thresholds</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configured service departments within {user?.institution_name}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    SLA: {dept.sla_hours}h
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{dept.description || 'General departmental services'}</p>
                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Categories: <strong className="text-slate-700">{dept.categories?.length || 0}</strong></span>
                  <span>Code: <strong className="font-mono text-slate-700">{dept.code}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          isOpen={!!selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onUpdated={() => fetchAdminData()}
        />
      )}
    </DashboardLayout>
  );
}
