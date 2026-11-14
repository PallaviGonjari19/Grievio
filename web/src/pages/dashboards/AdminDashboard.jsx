import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
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
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [pendingRes, deptsRes] = await Promise.all([
        apiClient.get('/accounts/pending-users/'),
        apiClient.get('/departments/'),
      ]);
      setPendingUsers(pendingRes.data.results || pendingRes.data);
      setDepartments(deptsRes.data.results || deptsRes.data);
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
    const reason = window.prompt(`Enter reason for rejecting ${username}:`, 'Unverified roll number');
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

  return (
    <DashboardLayout activeTab="overview">
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
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
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Departments</span>
            <p className="text-2xl font-black text-slate-900">{departments.length}</p>
            <p className="text-[11px] text-slate-500">Configured in institution</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Default SLA Target</span>
            <p className="text-2xl font-black text-brand-600">&lt; 24h</p>
            <p className="text-[11px] text-slate-500">Turnaround threshold</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tenant Security</span>
            <p className="text-2xl font-black text-emerald-600">Strict</p>
            <p className="text-[11px] text-slate-500">Row-level isolation enforced</p>
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

        {/* SECTION 2: Active Departments & SLAs */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Departments & SLA Thresholds</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Departments receiving grievances within {user?.institution_name}.
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
                <div className="pt-2 text-[11px] text-slate-400">
                  <span>Categories: </span>
                  <span className="font-semibold text-slate-700">{dept.categories?.length || 0} configured</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
