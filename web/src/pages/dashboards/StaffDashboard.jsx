import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText,
  UserCheck,
  ChevronRight,
  Search,
  Filter,
  Check,
  RotateCcw,
  UserPlus,
  Sparkles,
  MapPin,
  Building2,
  AlertTriangle,
  ArrowUpRight,
  Copy,
  CheckCheck
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchDepartmentComplaints = async () => {
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
      console.error('Error fetching staff complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentComplaints();
  }, [searchQuery]);

  const handleClaimTicket = async (e, complaintId) => {
    e.stopPropagation();
    try {
      await apiClient.patch(`/complaints/${complaintId}/status/`, {
        assigned_staff_id: user?.id,
        status: 'IN_PROGRESS'
      });
      setActionSuccess('✓ Ticket successfully claimed and marked In Progress!');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchDepartmentComplaints();
    } catch (err) {
      console.error('Failed to claim ticket:', err);
      alert('Failed to claim ticket.');
    }
  };

  const copyTicketCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            RESOLVED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Check className="w-3.5 h-3.5 text-slate-500" />
            CLOSED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Clock className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
            IN PROGRESS
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            ASSIGNED
          </span>
        );
      case 'REOPENED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            REOPENED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            SUBMITTED
          </span>
        );
    }
  };

  const myAssignmentsCount = complaints.filter((c) => c.assigned_staff === user?.id).length;
  const unassignedCount = complaints.filter(
    (c) => !c.assigned_staff && ['SUBMITTED', 'ACKNOWLEDGED'].includes(c.status)
  ).length;
  const resolvedCount = complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  const filteredComplaints = complaints.filter((c) => {
    if (filterMode === 'MY_ASSIGNMENTS') {
      return c.assigned_staff === user?.id;
    }
    if (filterMode === 'UNASSIGNED') {
      return !c.assigned_staff && ['SUBMITTED', 'ACKNOWLEDGED'].includes(c.status);
    }
    if (filterMode === 'RESOLVED') {
      return ['RESOLVED', 'CLOSED'].includes(c.status);
    }
    return true;
  });

  return (
    <DashboardLayout activeTab="overview" onSelectComplaint={(id) => setSelectedComplaintId(id)}>
      <div className="space-y-8">
        
        {/* Toast */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')} className="text-emerald-500 hover:text-emerald-800 p-1">✕</button>
          </div>
        )}

        {/* Staff Header */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              <span>Department Maintenance Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Institution: <span className="font-semibold text-slate-700">{user?.institution_name}</span> ({user?.institution_code}) &bull; Authorized Technician
            </p>
          </div>

          <button
            onClick={fetchDepartmentComplaints}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer relative shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department Pool</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900">{complaints.length}</p>
            <p className="text-[11px] text-slate-500">Total department queue</p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Unassigned</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{unassignedCount}</p>
            <p className="text-[11px] text-slate-500">Ready for claim</p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">My Active Work</span>
              <UserCheck className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-2xl font-black text-brand-600">{myAssignmentsCount}</p>
            <p className="text-[11px] text-slate-500">Assigned directly to you</p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
            <p className="text-[11px] text-slate-500">Completed with photo proof</p>
          </div>
        </div>

        {/* Maintenance Queue */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                Department Grievance Triage Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Claim tickets or upload repair evidence to resolve concerns</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none w-52 bg-slate-50/50 hover:bg-white transition"
                />
              </div>

              <div className="inline-flex p-1 bg-slate-100/80 rounded-xl text-xs font-bold text-slate-600">
                <button
                  onClick={() => setFilterMode('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    filterMode === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  All ({complaints.length})
                </button>
                <button
                  onClick={() => setFilterMode('MY_ASSIGNMENTS')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    filterMode === 'MY_ASSIGNMENTS' ? 'bg-white text-brand-700 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  Mine ({myAssignmentsCount})
                </button>
                <button
                  onClick={() => setFilterMode('UNASSIGNED')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    filterMode === 'UNASSIGNED' ? 'bg-white text-amber-800 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  Unassigned ({unassignedCount})
                </button>
                <button
                  onClick={() => setFilterMode('RESOLVED')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    filterMode === 'RESOLVED' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500">Updating triage queue...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">Queue is Clear</h4>
              <p className="text-xs text-slate-500">No grievance tickets match this filter. Great job keeping the campus running smoothly!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-3">Ticket #</th>
                    <th className="py-3 px-3">Concern Summary</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Technician</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredComplaints.map((c) => {
                    const isUnassigned = !c.assigned_staff;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedComplaintId(c.id)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-brand-600">
                            <span>{c.ticket_number}</span>
                            <button
                              type="button"
                              onClick={(e) => copyTicketCode(e, c.ticket_number)}
                              className="p-1 text-slate-400 hover:text-brand-600 rounded"
                            >
                              {copiedCode === c.ticket_number ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-3 max-w-xs">
                          <p className="font-bold text-slate-900 group-hover:text-brand-600 transition truncate">
                            {c.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            Reported by: {c.student_name || 'Student'} &bull; {c.category_name}
                          </p>
                        </td>

                        <td className="py-4 px-3 text-slate-600 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {c.location_name || 'Campus'}
                          </span>
                        </td>

                        <td className="py-4 px-3">
                          {getPriorityBadge(c.priority)}
                        </td>

                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1.5">
                            {getStatusBadge(c.status)}
                            {c.is_overdue && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-3 text-slate-600 font-medium">
                          {c.assigned_staff_name ? (
                            <span className="inline-flex items-center gap-1 text-slate-800 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              {c.assigned_staff_name}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Unclaimed
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {isUnassigned && ['SUBMITTED', 'ACKNOWLEDGED'].includes(c.status) && (
                              <button
                                type="button"
                                onClick={(e) => handleClaimTicket(e, c.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3" />
                                Claim
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedComplaintId(c.id)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 p-1"
                            >
                              <span>Inspect</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          isOpen={!!selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onUpdated={() => fetchDepartmentComplaints()}
        />
      )}
    </DashboardLayout>
  );
}
