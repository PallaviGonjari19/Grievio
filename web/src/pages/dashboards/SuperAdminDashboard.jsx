import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import { 
  ShieldCheck, 
  Building2, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Lock,
  PlusCircle,
  RefreshCw,
  Search,
  Check,
  X,
  AlertTriangle,
  Users,
  FileText,
  Loader2,
  Globe,
  Mail,
  Phone,
  Crown,
  Sparkles,
  MapPin,
  ArrowUpRight,
  Copy,
  CheckCheck
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  
  // Provisioning modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    status: 'ACTIVE'
  });
  
  const [feedback, setFeedback] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [instRes, pendingRes] = await Promise.all([
        apiClient.get('/institutions/'),
        apiClient.get('/accounts/pending-users/').catch(() => ({ data: [] }))
      ]);
      setInstitutions(instRes.data.results || instRes.data);
      setPendingUsers(pendingRes.data.results || pendingRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const copyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApproveUser = async (userId, username) => {
    setActionLoadingId(userId);
    setFeedback('');
    try {
      await apiClient.post(`/accounts/users/${userId}/approve/`, { action: 'approve' });
      setFeedback(`✓ User ${username} successfully approved! Full campus access granted.`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve registration.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectUser = async (userId, username) => {
    const reason = window.prompt(`Enter reason for rejecting ${username}:`, 'Unverified credentials');
    if (reason === null) return;

    setActionLoadingId(userId);
    setFeedback('');
    try {
      await apiClient.post(`/accounts/users/${userId}/approve/`, { action: 'reject', reason });
      setFeedback(`✗ User ${username} registration rejected.`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject registration.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (instId, targetStatus) => {
    setActionLoadingId(instId);
    setFeedback('');
    try {
      await apiClient.patch(`/institutions/${instId}/status/`, { status: targetStatus });
      setFeedback(`✓ Institution status successfully updated to ${targetStatus}.`);
      setInstitutions((prev) =>
        prev.map((inst) => (inst.id === instId ? { ...inst, status: targetStatus, is_active: targetStatus === 'ACTIVE' } : inst))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update institution status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleProvisionCollege = async (e) => {
    e.preventDefault();
    setProvisioning(true);
    setFeedback('');
    try {
      const res = await apiClient.post('/institutions/', formData);
      setFeedback(`✓ Institution '${res.data.name}' successfully provisioned with code [${res.data.code}]!`);
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        website: '',
        status: 'ACTIVE'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Provisioning error:', err);
      const errData = err.response?.data;
      if (typeof errData === 'object' && errData !== null) {
        const firstKey = Object.keys(errData)[0];
        alert(`${firstKey}: ${Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey]}`);
      } else {
        alert('Failed to register educational institution.');
      }
    } finally {
      setProvisioning(false);
    }
  };

  const filteredColleges = institutions.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout activeTab="overview">
      <div className="space-y-8">
        
        {/* Banner */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              <span>Platform Super Administrator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Global Platform Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Centralized tenant management, multi-institution onboarding, zero-trust cryptographic isolation, and cross-campus auditing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Provision New College</span>
            </button>
            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs"
            >
              <span>Django Admin</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback('')} className="text-emerald-500 hover:text-emerald-800 p-1">✕</button>
          </div>
        )}

        {/* Global Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Colleges</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-700">{institutions.length}</p>
            <p className="text-[11px] text-slate-500">Total institutional tenants</p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Instances</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600">
              {institutions.filter((c) => c.status === 'ACTIVE').length}
            </p>
            <p className="text-[11px] text-slate-500">Live operational campus portals</p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suspended Instances</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600">
              {institutions.filter((c) => c.status !== 'ACTIVE').length}
            </p>
            <p className="text-[11px] text-slate-500">Blocked access & registrations</p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security Architecture</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">Zero-Trust</p>
            <p className="text-[11px] text-slate-500">Row-level partition enforced</p>
          </div>
        </div>

        {/* Pending Registration Queue (Platform-Wide) */}
        {pendingUsers.length > 0 && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-amber-200/80 shadow-md p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Platform-Wide Pending Registrations</h3>
                  <p className="text-xs text-slate-500">Students and staff awaiting admin verification across all colleges</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {pendingUsers.length} Pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-3">Applicant Name</th>
                    <th className="py-3 px-3">Username</th>
                    <th className="py-3 px-3">College & Code</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {pendingUsers.map((pending) => (
                    <tr key={pending.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {pending.first_name ? `${pending.first_name} ${pending.last_name}` : pending.username}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{pending.username}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-purple-700">{pending.institution_name}</span>
                        <span className="text-slate-400 ml-1 font-mono text-[11px]">({pending.institution_code})</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{pending.email}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          pending.role === 'STAFF' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {pending.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApproveUser(pending.id, pending.username)}
                            disabled={actionLoadingId === pending.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectUser(pending.id, pending.username)}
                            disabled={actionLoadingId === pending.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 font-bold text-xs transition disabled:opacity-50 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* College Instances Directory */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Provisioned Institutions Directory</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Onboarded educational institutions and platform lifecycle governance
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search institutions..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none w-52 bg-slate-50/50 hover:bg-white transition"
                />
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                title="Refresh Directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500">Loading institutions directory...</p>
            </div>
          ) : filteredColleges.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">No institutions found matching criteria.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredColleges.map((c) => (
                <div 
                  key={c.id} 
                  className="p-6 rounded-3xl border border-slate-200/90 bg-white hover:border-purple-200 hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-50 border border-purple-200/60 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0 shadow-2xs">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{c.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyCode(e, c.code)}
                            title="Copy code"
                            className="p-1 text-slate-400 hover:text-purple-600 rounded"
                          >
                            {copiedCode === c.code ? (
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.contact_email}</span>
                    </p>
                    {c.website && (
                      <p className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <a href={c.website} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-1 truncate">
                          {c.website}
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Telemetry counters */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/70">
                      <p className="text-sm font-black text-slate-900">{c.departments_count ?? 0}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Depts</p>
                    </div>
                    <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/70">
                      <p className="text-sm font-black text-slate-900">{c.users_count ?? 0}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Members</p>
                    </div>
                    <div className="bg-purple-50/60 p-2.5 rounded-2xl border border-purple-200/60">
                      <p className="text-sm font-black text-purple-700">{c.complaints_count ?? 0}</p>
                      <p className="text-[10px] text-purple-600 uppercase font-bold tracking-wider">Tickets</p>
                    </div>
                  </div>

                  {/* Lifecycle Controls */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-medium">Instance Lifecycle:</span>
                    <div className="flex items-center gap-2">
                      {c.status !== 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(c.id, 'ACTIVE')}
                          disabled={actionLoadingId === c.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(c.id, 'SUSPENDED')}
                          disabled={actionLoadingId === c.id}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                      {c.status !== 'DEACTIVATED' && (
                        <button
                          onClick={() => handleStatusChange(c.id, 'DEACTIVATED')}
                          disabled={actionLoadingId === c.id}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs transition cursor-pointer"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Provision College Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Provision Educational Institution</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <form onSubmit={handleProvisionCollege} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford Polytechnic Institute"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unique College Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAN-TECH"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono font-bold uppercase tracking-wider"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Students and staff will use this code to register.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@college.edu"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://www.college.edu"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus Physical Address</label>
                <textarea
                  placeholder="City, State, Country"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisioning}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  {provisioning ? 'Registering...' : 'Complete Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
