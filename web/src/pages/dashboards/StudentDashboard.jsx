import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import { 
  FileText, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/complaints/');
      setComplaints(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

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
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {status}</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 flex items-center gap-1"><Clock className="w-3 h-3" /> IN PROGRESS</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">{status}</span>;
    }
  };

  return (
    <DashboardLayout activeTab="overview">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>STUDENT GRIEVANCE PORTAL</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Institution: <span className="font-semibold text-slate-700">{user?.institution_name}</span> ({user?.institution_code}) • Verified Student
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => alert('Phase 3 Grievance Submission Form: The multi-step photo submission wizard will be implemented in Phase 3.')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              Raise New Concern
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Total Submissions</span>
            <p className="text-2xl font-black text-slate-900">{complaints.length}</p>
            <p className="text-[11px] text-slate-500">Tracked under your account</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Progress & Review</span>
            <p className="text-2xl font-black text-amber-600">
              {complaints.filter((c) => ['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(c.status)).length}
            </p>
            <p className="text-[11px] text-slate-500">Currently assigned to technicians</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved Concerns</span>
            <p className="text-2xl font-black text-emerald-600">
              {complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length}
            </p>
            <p className="text-[11px] text-slate-500">Completed with evidence</p>
          </div>
        </div>

        {/* Grievance Timeline & History Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">My Raised Grievances</h3>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No Active Complaints</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't submitted any complaints yet. When you notice maintenance or departmental issues, click "Raise New Concern" above.
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
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assigned Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-brand-600">{c.ticket_number}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-900">{c.title}</td>
                      <td className="py-3.5 px-3 text-slate-600">{c.department_name}</td>
                      <td className="py-3.5 px-3">{getPriorityBadge(c.priority)}</td>
                      <td className="py-3.5 px-3">{getStatusBadge(c.status)}</td>
                      <td className="py-3.5 px-3 text-slate-500">{c.assigned_staff_name || 'Triage in progress'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
