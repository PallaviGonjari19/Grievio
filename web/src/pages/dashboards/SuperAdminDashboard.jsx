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
  Phone
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/institutions/');
      setInstitutions(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load institutions directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleStatusChange = async (instId, targetStatus) => {
    setActionLoadingId(instId);
    setFeedback('');
    try {
      await apiClient.patch(`/institutions/${instId}/status/`, { status: targetStatus });
      setFeedback(`Institution status successfully updated to ${targetStatus}.`);
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
      setFeedback(`Institution '${res.data.name}' successfully provisioned with code [${res.data.code}]!`);
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
      fetchInstitutions();
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>GRIEVIO GLOBAL PLATFORM GOVERNANCE</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Platform Super Administrator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as: <span className="font-mono font-semibold text-slate-700">{user?.username}</span> • Global multi-tenant jurisdiction
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Provision New College
            </button>
            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              Django Admin
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback('')} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Global Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Colleges</span>
            <p className="text-2xl font-black text-purple-600">{institutions.length}</p>
            <p className="text-[11px] text-slate-500">Total institutional tenants</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Instances</span>
            <p className="text-2xl font-black text-emerald-600">
              {institutions.filter((c) => c.status === 'ACTIVE').length}
            </p>
            <p className="text-[11px] text-slate-500">Live operational campus portals</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suspended Instances</span>
            <p className="text-2xl font-black text-amber-600">
              {institutions.filter((c) => c.status !== 'ACTIVE').length}
            </p>
            <p className="text-[11px] text-slate-500">Blocked access & registrations</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Isolation Standard</span>
            <p className="text-2xl font-black text-slate-900">Zero-Trust</p>
            <p className="text-[11px] text-slate-500">Server-side row partition active</p>
          </div>
        </div>

        {/* College Instances Directory */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Provisioned Institutions Directory</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Onboarded educational institutions and platform lifecycle governance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search institutions..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-purple-500 outline-none w-48"
                />
              </div>
              <button
                onClick={fetchInstitutions}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                title="Refresh Directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading institutions directory...</div>
          ) : filteredColleges.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No institutions found matching criteria.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredColleges.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                      <p className="font-mono text-xs text-purple-600 font-semibold mt-0.5">
                        Code: {c.code}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.contact_email}</span>
                    </p>
                    {c.website && (
                      <p className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <a href={c.website} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">
                          {c.website}
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Telemetry counters */}
                  <div className="pt-2 border-t border-slate-200/70 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <p className="text-xs font-black text-slate-800">{c.departments_count ?? 0}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Depts</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <p className="text-xs font-black text-slate-800">{c.users_count ?? 0}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Members</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <p className="text-xs font-black text-purple-600">{c.complaints_count ?? 0}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Tickets</p>
                    </div>
                  </div>

                  {/* Lifecycle Controls */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Lifecycle Controls:</span>
                    <div className="flex items-center gap-1.5">
                      {c.status !== 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(c.id, 'ACTIVE')}
                          disabled={actionLoadingId === c.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(c.id, 'SUSPENDED')}
                          disabled={actionLoadingId === c.id}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] transition"
                        >
                          Suspend
                        </button>
                      )}
                      {c.status !== 'DEACTIVATED' && (
                        <button
                          onClick={() => handleStatusChange(c.id, 'DEACTIVATED')}
                          disabled={actionLoadingId === c.id}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-[10px] transition"
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
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Provision Educational Institution</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleProvisionCollege} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institution Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford Polytechnic Institute"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unique College Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAN-TECH"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-purple-500 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400">Students and staff will use this code to register.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@college.edu"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://www.college.edu"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Physical Address</label>
                <textarea
                  placeholder="City, State, Country"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisioning}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50"
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
