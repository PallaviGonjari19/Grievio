import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building, 
  ShieldCheck, 
  Mail, 
  User, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Search,
  Eye,
  EyeOff,
  GraduationCap,
  Wrench
} from 'lucide-react';
import apiClient from '../services/api';

export default function RegisterPage() {
  const [role, setRole] = useState('STUDENT');
  const [collegeCode, setCollegeCode] = useState('');
  const [verifiedInstitution, setVerifiedInstitution] = useState(null);
  const [codeLookupLoading, setCodeLookupLoading] = useState(false);
  const [codeLookupError, setCodeLookupError] = useState('');

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();

  // Real-time college code verification
  const handleVerifyCode = async (codeToVerify) => {
    const code = (codeToVerify || collegeCode).trim().toUpperCase();
    if (!code) return;

    setCodeLookupLoading(true);
    setCodeLookupError('');
    setVerifiedInstitution(null);

    try {
      const res = await apiClient.get(`/institutions/lookup/?code=${code}`);
      setVerifiedInstitution(res.data);
    } catch (err) {
      setCodeLookupError(
        err.response?.data?.error || 'Invalid or inactive college code. Please check with your campus desk.'
      );
    } finally {
      setCodeLookupLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!verifiedInstitution) {
      setSubmitError('Please verify a valid college code before registering.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/accounts/register/', {
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        role,
        institution_code: verifiedInstitution.code,
      });

      setRegistrationSuccess({
        username: res.data.username,
        email: res.data.email,
        institutionName: verifiedInstitution.name,
        institutionCode: verifiedInstitution.code,
      });
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        const errorList = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
          .join(' | ');
        setSubmitError(errorList || 'Registration failed.');
      } else {
        setSubmitError('Registration failed. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 bg-gradient-to-br from-indigo-50/40 via-slate-50 to-emerald-50/20">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/90 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              Status: Pending Review
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registration Submitted!</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your account has been created and placed into your college's administrative verification queue.
            </p>
          </div>

          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Username:</span>
              <span className="font-bold text-slate-800">{registrationSuccess.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Institution:</span>
              <span className="font-bold text-brand-600">{registrationSuccess.institutionName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">College Code:</span>
              <span className="font-bold text-slate-800">{registrationSuccess.institutionCode}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Once approved by your College Administrator, you can log in to submit and track campus grievances.
          </p>

          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 py-3 rounded-xl shadow-md shadow-brand-500/20 transition cursor-pointer"
          >
            Go to Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50/40 via-slate-50 to-blue-50/30">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl shadow-indigo-500/5 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Campus Registration</h2>
          <p className="text-xs text-slate-500">Join your institution's verified campus grievance network</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition cursor-pointer ${
              role === 'STUDENT'
                ? 'bg-white text-brand-700 shadow-xs border border-slate-200/60 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student Account
          </button>
          <button
            type="button"
            onClick={() => setRole('STAFF')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition cursor-pointer ${
              role === 'STAFF'
                ? 'bg-white text-brand-700 shadow-xs border border-slate-200/60 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Department Staff
          </button>
        </div>

        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Step 1: College Code Verification */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">1. Unique College Code</label>
              <span className="text-[10px] text-slate-400 font-mono">e.g. APEX-TECH, COEP-COMP</span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={collegeCode}
                  onChange={(e) => {
                    setCollegeCode(e.target.value.toUpperCase());
                    setVerifiedInstitution(null);
                    setCodeLookupError('');
                  }}
                  placeholder="APEX-TECH or COEP-COMP"
                  className="w-full text-xs font-mono font-bold tracking-wider rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 uppercase bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                />
              </div>

              <button
                type="button"
                onClick={() => handleVerifyCode()}
                disabled={codeLookupLoading || !collegeCode.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                {codeLookupLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Verify Code
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Code helper */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
              <span>Quick-Test Codes:</span>
              <button
                type="button"
                onClick={() => {
                  setCollegeCode('APEX-TECH');
                  handleVerifyCode('APEX-TECH');
                }}
                className="px-2 py-0.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded border border-brand-200 font-mono font-semibold"
              >
                APEX-TECH
              </button>
              <button
                type="button"
                onClick={() => {
                  setCollegeCode('COEP-COMP');
                  handleVerifyCode('COEP-COMP');
                }}
                className="px-2 py-0.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded border border-brand-200 font-mono font-semibold"
              >
                COEP-COMP
              </button>
            </div>

            {/* Verification Success Box */}
            {verifiedInstitution && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs space-y-1 shadow-2xs animate-in fade-in">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Institution
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-800 font-mono text-[10px]">
                    {verifiedInstitution.code}
                  </span>
                </div>
                <p className="font-extrabold text-sm text-slate-900">{verifiedInstitution.name}</p>
                <p className="text-[11px] text-emerald-700">{verifiedInstitution.address || 'Campus Directory Verified'}</p>
              </div>
            )}

            {codeLookupError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{codeLookupError}</span>
              </div>
            )}
          </div>

          {/* Step 2: Account Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">2. Personal & Account Credentials</label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Johnson"
                  className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex.johnson"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.johnson@apex.edu"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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
          </div>

          <button
            type="submit"
            disabled={submitting || !verifiedInstitution}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Registration...
              </>
            ) : (
              <>
                <span>Complete Campus Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-bold hover:underline">
            Sign In to Grievio &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
