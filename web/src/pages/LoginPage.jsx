import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Building, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Clock,
  Camera,
  Layers,
  GraduationCap,
  Wrench,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeDemo, setActiveDemo] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Quick test demo accounts
  const demoAccounts = {
    admin: { user: 'apex_admin', pass: 'Password123!', label: 'College Admin', icon: Building, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    student: { user: 'student_apex', pass: 'Password123!', label: 'Approved Student', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    pending: { user: 'student_pending', pass: 'Password123!', label: 'Pending Student', icon: Clock, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    staff: { user: 'staff_apex', pass: 'Password123!', label: 'Department Staff', icon: Wrench, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    superadmin: { user: 'superadmin', pass: 'Password123!', label: 'Platform Super Admin', icon: Crown, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  };

  const fillDemoCredentials = (accKey) => {
    const acc = demoAccounts[accKey];
    if (acc) {
      setUsername(acc.user);
      setPassword(acc.pass);
      setActiveDemo(accKey);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      const user = result.user;
      if (user.approval_status === 'PENDING' || user.approval_status === 'REJECTED') {
        navigate('/pending-approval');
      } else if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'SUPERADMIN') {
        navigate('/superadmin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50/40 via-slate-50 to-blue-50/30">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Brand Showcase & Value Props */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Next-Gen Campus Governance Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Sign In to Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                Campus Portal
              </span>
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Log in to manage facility repairs, file grievances, track SLA compliance, and collaborate across departments with full audit transparency.
            </p>
          </div>

          {/* Value Pillars */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Automated SLA Escalation</h4>
                <p className="text-[11px] text-slate-500">Tickets are tracked against guaranteed turnaround deadlines with auto-alerts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Photographic Evidence Trail</h4>
                <p className="text-[11px] text-slate-500">Every repair requires photographic verification before closing.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Zero-Trust Campus Isolation</h4>
                <p className="text-[11px] text-slate-500">Strict multi-tenant partitioning ensures complete data privacy for your institution.</p>
              </div>
            </div>
          </div>

          {/* Social Proof / Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/80 text-center">
            <div className="p-2">
              <span className="block text-lg font-black text-slate-900">30+</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Campuses</span>
            </div>
            <div className="p-2 border-x border-slate-200/80">
              <span className="block text-lg font-black text-brand-600">99.4%</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">SLA Adherence</span>
            </div>
            <div className="p-2">
              <span className="block text-lg font-black text-slate-900">10k+</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Resolved</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-6">
          <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl shadow-indigo-500/5 space-y-6">
            
            <div className="space-y-1 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 mb-3 mx-auto sm:mx-0">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Grievio</h2>
              <p className="text-xs text-slate-500">Access your centralized multi-institution workspace</p>
            </div>

            {/* Quick Demo Switcher */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Quick-Demo Accounts
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click Auto Fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(demoAccounts).map(([key, acc]) => {
                  const Icon = acc.icon;
                  const isActive = activeDemo === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => fillDemoCredentials(key)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left font-medium transition cursor-pointer ${
                        key === 'superadmin' ? 'col-span-2' : ''
                      } ${
                        isActive
                          ? `${acc.color} ring-2 ring-brand-500/30 font-bold shadow-xs`
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{acc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username or Official Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setActiveDemo(null);
                    }}
                    placeholder="e.g. apex_admin or student_apex"
                    className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setActiveDemo(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 space-y-2">
              <p>
                First time on Grievio?{' '}
                <Link to="/register" className="text-brand-600 font-bold hover:underline">
                  Register with College Code &rarr;
                </Link>
              </p>
              <p className="text-[11px] text-slate-400">
                Protected by multi-tenant cryptographic session tokens.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
