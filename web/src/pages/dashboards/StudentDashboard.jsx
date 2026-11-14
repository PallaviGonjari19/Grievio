import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import NewComplaintModal from '../../components/complaints/NewComplaintModal';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { 
  FileText, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ChevronRight, 
  ShieldCheck, 
  RefreshCw,
  Search,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let endpoint = '/complaints/';
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      const res = await apiClient.get(endpoint);
      setComplaints(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [searchQuery]);

  const handleNewComplaintSuccess = (newComplaint) => {
    setSuccessToast(`Grievance #${newComplaint.ticket_number} created successfully! Our team will triage it shortly.`);
    setTimeout(() => setSuccessToast(''), 6000);
    fetchComplaints();
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

  // Filter complaints in memory for fast tab switching
  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'ACTIVE') {
      return ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(c.status);
    }
    if (filterStatus === 'RESOLVED') {
      return ['RESOLVED', 'CLOSED'].includes(c.status);
    }
    return true;
  });

  return (
    <DashboardLayout activeTab="overview">
      <div className="space-y-8">
        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

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
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
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
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active & Under Maintenance</span>
            <p className="text-2xl font-black text-amber-600">
              {complaints.filter((c) => ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(c.status)).length}
            </p>
            <p className="text-[11px] text-slate-500">Currently assigned or triaged</p>
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
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">My Raised Grievances</h3>
            </div>

            {/* Filter pills & search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-brand-500 outline-none w-44"
                />
              </div>

              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3 py-1 rounded-lg transition ${filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
                >
                  All ({complaints.length})
                </button>
                <button
                  onClick={() => setFilterStatus('ACTIVE')}
                  className={`px-3 py-1 rounded-lg transition ${filterStatus === 'ACTIVE' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('RESOLVED')}
                  className={`px-3 py-1 rounded-lg transition ${filterStatus === 'RESOLVED' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No Complaints Matching Filter</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {complaints.length === 0
                  ? "You haven't submitted any complaints yet. When you notice maintenance or departmental issues, click 'Raise New Concern' above."
                  : "No grievances found matching the selected filter criteria."}
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
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assigned Technician</th>
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
                      <td className="py-3.5 px-3 text-slate-500">{c.location_name || 'Campus'}</td>
                      <td className="py-3.5 px-3">{getPriorityBadge(c.priority)}</td>
                      <td className="py-3.5 px-3">{getStatusBadge(c.status)}</td>
                      <td className="py-3.5 px-3 text-slate-500">{c.assigned_staff_name || 'Triage in progress'}</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-xs font-semibold text-brand-600 group-hover:underline flex items-center justify-end gap-1">
                          View details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Complaint Modal */}
      <NewComplaintModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleNewComplaintSuccess}
      />

      {/* Complaint Detail Modal */}
      {selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          isOpen={!!selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onUpdated={() => fetchComplaints()}
        />
      )}
    </DashboardLayout>
  );
}
