import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldAlert, RefreshCw, LogOut, CheckCircle2, Building2 } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');

  const handleRefresh = async () => {
    setChecking(true);
    setMsg('');
    const updated = await refreshProfile();
    setChecking(false);

    if (updated?.approval_status === 'APPROVED') {
      if (updated.role === 'STUDENT') navigate('/student/dashboard');
      else if (updated.role === 'STAFF') navigate('/staff/dashboard');
      else if (updated.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } else {
      setMsg('Status is still Pending. Your College Administrator has not approved your registration yet.');
    }
  };

  const isRejected = user?.approval_status === 'REJECTED';

  return (
    <div className="max-w-xl mx-auto py-16 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center space-y-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
          isRejected ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {isRejected ? <ShieldAlert className="w-8 h-8" /> : <Clock className="w-8 h-8 animate-pulse" />}
        </div>

        <div className="space-y-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isRejected ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isRejected ? 'Registration Rejected' : 'Verification In Progress'}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRejected ? 'Registration Not Approved' : 'Awaiting Administrator Approval'}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {isRejected
              ? 'Your registration could not be verified by your college administration.'
              : 'Your account has been submitted to your campus administration for verification against official college records.'}
          </p>
        </div>

        {/* Institution Info Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Account Username:</span>
            <span className="font-semibold text-slate-800">{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Institution:</span>
            <span className="font-semibold text-brand-600">{user?.institution_name || 'Assigned College'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">College Code:</span>
            <span className="font-semibold text-slate-800">{user?.institution_code || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Application Status:</span>
            <span className={`font-semibold ${isRejected ? 'text-rose-600' : 'text-amber-600'}`}>
              {user?.approval_status || 'PENDING'}
            </span>
          </div>
          {isRejected && user?.rejection_reason && (
            <div className="pt-2 border-t border-slate-200 text-rose-700">
              <strong>Reason:</strong> {user.rejection_reason}
            </div>
          )}
        </div>

        {msg && (
          <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
            {msg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isRejected && (
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking Status...' : 'Check Approval Status'}
            </button>
          )}

          <button
            onClick={logout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
