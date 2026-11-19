import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  ShieldAlert, 
  RefreshCw, 
  LogOut, 
  CheckCircle2, 
  Building2,
  Mail,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');
  const [lastChecked, setLastChecked] = useState(null);

  const handleRefresh = async () => {
    setChecking(true);
    setMsg('');
    const token = localStorage.getItem('grievio_access_token');
    if (!token) {
      setChecking(false);
      navigate('/login');
      return;
    }
    const updated = await refreshProfile();
    setChecking(false);
    setLastChecked(new Date().toLocaleTimeString());

    if (updated?.approval_status === 'APPROVED') {
      if (updated.role === 'STUDENT') navigate('/student/dashboard');
      else if (updated.role === 'STAFF') navigate('/staff/dashboard');
      else if (updated.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } else if (updated) {
      setMsg('Status is still Pending. Your College Administrator has not approved your registration yet.');
    } else {
      setMsg('Session expired or not signed in. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    }
  };

  const isRejected = user?.approval_status === 'REJECTED';

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 bg-gradient-to-br from-indigo-50/40 via-slate-50 to-blue-50/30">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Please Sign In</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your registration has been submitted and approved. Please sign in with your credentials to access your dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition cursor-pointer"
          >
            Go to Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 bg-gradient-to-br from-indigo-50/40 via-slate-50 to-amber-50/20">
      <div className="max-w-2xl w-full space-y-6">

        {/* Verification Progress Stepper Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-xl p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-md ${
              isRejected 
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-rose-500/10' 
                : 'bg-amber-50 text-amber-600 border border-amber-200 shadow-amber-500/10'
            }`}>
              {isRejected ? <ShieldAlert className="w-8 h-8" /> : <Clock className="w-8 h-8 animate-pulse" />}
            </div>

            <div className="space-y-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isRejected ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isRejected ? 'bg-rose-500' : 'bg-amber-500 animate-ping'}`}></span>
                {isRejected ? 'Registration Rejected' : 'Verification In Progress'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isRejected ? 'Registration Not Approved' : 'Awaiting Administrator Approval'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {isRejected
                  ? 'Your registration could not be verified by your college administration.'
                  : 'Your account has been placed into your campus administrative review queue for identity verification.'}
              </p>
            </div>
          </div>

          {/* 3-Step Lifecycle Visual Indicator */}
          {!isRejected && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div className="text-center p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div className="text-[11px] font-bold text-slate-800">1. Submitted</div>
                <div className="text-[9px] text-emerald-600 font-medium">Completed</div>
              </div>

              <div className="text-center p-2 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs">
                <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold animate-pulse">
                  2
                </div>
                <div className="text-[11px] font-bold text-amber-900">2. Verification</div>
                <div className="text-[9px] text-amber-700 font-medium">Under Review</div>
              </div>

              <div className="text-center p-2 rounded-xl bg-slate-50 text-slate-400">
                <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                  3
                </div>
                <div className="text-[11px] font-bold text-slate-500">3. Activation</div>
                <div className="text-[9px] text-slate-400">Full Access</div>
              </div>
            </div>
          )}

          {/* Account Details Card */}
          <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/80 text-xs space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Account Username</span>
              <span className="font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                {user?.username}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Educational Institution</span>
              <span className="font-bold text-brand-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {user?.institution_name || 'Assigned College'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Institution Code</span>
              <span className="font-bold text-slate-800 font-mono bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                {user?.institution_code || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Current Status</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                isRejected ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {user?.approval_status || 'PENDING'}
              </span>
            </div>

            {isRejected && user?.rejection_reason && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <strong>Rejection Reason:</strong> {user.rejection_reason}
              </div>
            )}
          </div>

          {msg && (
            <div className="p-3.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 flex items-start gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p>{msg}</p>
                {lastChecked && <p className="text-[10px] text-amber-600 mt-0.5">Last checked at: {lastChecked}</p>}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {!isRejected && (
              <button
                onClick={handleRefresh}
                disabled={checking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Checking Status...' : 'Check Approval Status'}
              </button>
            )}

            <button
              onClick={logout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              Sign Out
            </button>
          </div>

          {/* Helpful SLA / Contact Note */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400 space-y-1">
            <p>Campus administrators typically verify applications within 24 to 48 hours.</p>
            <p className="text-[11px] text-slate-400">
              Need immediate assistance? Contact your department coordinator or campus IT administrator.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
