import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText,
  UserCheck
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartmentComplaints = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/complaints/');
      setComplaints(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching staff complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentComplaints();
  }, []);

  return (
    <DashboardLayout activeTab="overview">
      <div className="space-y-8">
        {/* Staff Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
              <Wrench className="w-4 h-4" />
              <span>DEPARTMENT MAINTENANCE WORKBENCH</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Institution: <span className="font-semibold text-slate-700">{user?.institution_name}</span> ({user?.institution_code}) • Authorized Technician
            </p>
          </div>

          <button
            onClick={fetchDepartmentComplaints}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department Queue</span>
            <p className="text-2xl font-black text-slate-900">{complaints.length}</p>
            <p className="text-[11px] text-slate-500">Tickets in your department</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned to Me</span>
            <p className="text-2xl font-black text-amber-600">
              {complaints.filter((c) => c.assigned_staff === user?.id).length}
            </p>
            <p className="text-[11px] text-slate-500">Direct work orders</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved Work</span>
            <p className="text-2xl font-black text-emerald-600">
              {complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length}
            </p>
            <p className="text-[11px] text-slate-500">Verified repairs</p>
          </div>
        </div>

        {/* Ticket List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Active Department Complaints</h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading department queue...</div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Queue is Clear</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active complaints are currently filed under your department. New student tickets will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-3">Ticket #</th>
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-brand-600">{c.ticket_number}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-900">{c.title}</td>
                      <td className="py-3.5 px-3 text-slate-600">{c.category_name}</td>
                      <td className="py-3.5 px-3 text-slate-700">{c.student_name || 'Student'}</td>
                      <td className="py-3.5 px-3 font-semibold">{c.priority}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {c.status}
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
    </DashboardLayout>
  );
}
