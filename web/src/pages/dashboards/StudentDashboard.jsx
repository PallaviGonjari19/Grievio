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
  RotateCcw,
  Sparkles,
  MapPin,
  Copy,
  CheckCheck,
  Calendar,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  
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

  const copyTicketCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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

  // Mini Lifecycle Stepper helper for ticket row
  const renderMiniStepper = (status) => {
    const steps = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'];
    let activeIdx = 0;
    if (['ASSIGNED', 'IN_PROGRESS'].includes(status)) activeIdx = 1;
    if (['RESOLVED', 'CLOSED'].includes(status)) activeIdx = 2;
    if (status === 'REOPENED') activeIdx = 1;

    return (
      <div className="flex items-center gap-1">
        {steps.map((st, i) => (
          <div key={st} className="flex items-center">
            <span className={`w-2 h-2 rounded-full ${
              i <= activeIdx 
                ? activeIdx === 2 ? 'bg-emerald-500' : 'bg-brand-600' 
                : 'bg-slate-200'
            }`} />
            {i < steps.length - 1 && (
              <span className={`w-3 h-0.5 ${i < activeIdx ? 'bg-brand-500' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'ACTIVE') {
      return ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(c.status);
    }
    if (filterStatus === 'RESOLVED') {
      return ['RESOLVED', 'CLOSED'].includes(c.status);
    }
    return true;
  });

  const activeCount = complaints.filter((c) =>
    ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(c.status)
  ).length;

  const resolvedCount = complaints.filter((c) =>
    ['RESOLVED', 'CLOSED'].includes(c.status)
  ).length;

  return (
    <DashboardLayout activeTab="overview" onSelectComplaint={(id) => setSelectedComplaintId(id)}>
      <div className="space-y-8">
        
        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="text-emerald-500 hover:text-emerald-800 p-1">✕</button>
          </div>
        )}

        {/* Hero Welcome Banner */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Campus Student</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.first_name || user?.username}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Track your campus facility repairs, report departmental concerns, and verify repair photos in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative">
            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Raise New Concern</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total */}
          <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative overflow-hidden group hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Grievances</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{complaints.length}</p>
              <p className="text-xs text-slate-500 mt-1">Submitted under your account</p>
            </div>
          </div>

          {/* Card 2: Active */}
          <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative overflow-hidden group hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Under Maintenance</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-amber-600 tracking-tight">{activeCount}</p>
                {activeCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    In Progress
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Under triage or technician repair</p>
            </div>
          </div>

          {/* Card 3: Resolved */}
          <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative overflow-hidden group hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved Concerns</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-emerald-600 tracking-tight">{resolvedCount}</p>
                {complaints.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {Math.round((resolvedCount / complaints.length) * 100)}% Resolved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Verified with photo evidence</p>
            </div>
          </div>
        </div>

        {/* Grievances Feed / Table Section */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                My Raised Grievances
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any ticket to review the evidence trail and comments</p>
            </div>

            {/* Filter pills & search */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket # or title..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none w-56 bg-slate-50/50 hover:bg-white transition"
                />
              </div>

              <div className="inline-flex p-1 bg-slate-100/80 rounded-xl text-xs font-bold text-slate-600">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  All ({complaints.length})
                </button>
                <button
                  onClick={() => setFilterStatus('ACTIVE')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    filterStatus === 'ACTIVE' ? 'bg-white text-amber-800 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setFilterStatus('RESOLVED')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    filterStatus === 'RESOLVED' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500">Loading your complaints queue...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">No Grievances Found</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {complaints.length === 0
                    ? "You haven't reported any maintenance or campus issues yet. Everything looks in order!"
                    : "No grievances match your current search or filter criteria."}
                </p>
              </div>
              {complaints.length === 0 && (
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Raise Your First Concern
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-3">Ticket #</th>
                    <th className="py-3 px-3">Concern Details</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status & Lifecycle</th>
                    <th className="py-3 px-3">Technician</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredComplaints.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedComplaintId(c.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Ticket Code */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-brand-600">
                          <span>{c.ticket_number}</span>
                          <button
                            type="button"
                            onClick={(e) => copyTicketCode(e, c.ticket_number)}
                            title="Copy ticket reference"
                            className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition"
                          >
                            {copiedCode === c.ticket_number ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Title & Date */}
                      <td className="py-4 px-3 max-w-xs">
                        <p className="font-bold text-slate-900 group-hover:text-brand-600 transition truncate">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {c.description?.slice(0, 48) || 'No description'}
                        </p>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-3 text-slate-700 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {c.department_name}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-3 text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.location_name || 'Campus'}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-3">
                        {getPriorityBadge(c.priority)}
                      </td>

                      {/* Status & Lifecycle Stepper */}
                      <td className="py-4 px-3 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(c.status)}
                          {c.is_overdue && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                            </span>
                          )}
                        </div>
                        <div className="pt-0.5">
                          {renderMiniStepper(c.status)}
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="py-4 px-3 text-slate-600 font-medium">
                        {c.assigned_staff_name ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {c.assigned_staff_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Triage in progress</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:text-brand-700 transition">
                          View <ArrowUpRight className="w-3.5 h-3.5" />
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
