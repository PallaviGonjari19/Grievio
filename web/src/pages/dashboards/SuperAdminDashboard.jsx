import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Building2, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Lock
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  const demoColleges = [
    {
      id: 1,
      name: 'Apex Institute of Technology',
      code: 'APEX-TECH',
      status: 'ACTIVE',
      email: 'admin@apex.edu',
      city: 'Silicon Valley, CA',
      departments: 3,
    },
    {
      id: 2,
      name: 'Beacon Engineering University',
      code: 'BEACON-ENG',
      status: 'ACTIVE',
      email: 'contact@beacon.edu',
      city: 'Boston, MA',
      departments: 2,
    },
  ];

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

          <a
            href="http://localhost:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
          >
            Open Django Admin Console
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Colleges</span>
            <p className="text-2xl font-black text-purple-600">{demoColleges.length}</p>
            <p className="text-[11px] text-slate-500">Active tenant instances</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tenant Partitioning</span>
            <p className="text-2xl font-black text-emerald-600">Row-Level</p>
            <p className="text-[11px] text-slate-500">Zero cross-tenant leaks</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">API Auth Protocol</span>
            <p className="text-2xl font-black text-brand-600">JWT Bearer</p>
            <p className="text-[11px] text-slate-500">Rotation & blacklisting</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Database Status</span>
            <p className="text-2xl font-black text-slate-900">Online</p>
            <p className="text-[11px] text-slate-500">Relational integrity ok</p>
          </div>
        </div>

        {/* College Instances Directory */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Provisioned Institutions Directory</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-3">Institution Name</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Contact Email</th>
                  <th className="py-3 px-3">Campus Location</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demoColleges.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{col.name}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-brand-600">{col.code}</td>
                    <td className="py-3.5 px-3 text-slate-600">{col.email}</td>
                    <td className="py-3.5 px-3 text-slate-600">{col.city}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {col.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
