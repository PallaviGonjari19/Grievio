import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, ShieldCheck, Mail, User, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
      <div className="max-w-md mx-auto py-16 px-4 sm:px-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Status: Pending Approval
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Registration Submitted!</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your account has been created and placed into your college's administrative review queue.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Username:</span>
              <span className="font-semibold text-slate-800">{registrationSuccess.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Institution:</span>
              <span className="font-semibold text-brand-600">{registrationSuccess.institutionName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">College Code:</span>
              <span className="font-semibold text-slate-800">{registrationSuccess.institutionCode}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Once approved by your College Administrator, you will have full access to submit and track grievances.
          </p>

          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 py-3 rounded-xl shadow-xs transition"
          >
            Go to Sign In
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Registration</h2>
          <p className="text-xs text-slate-500">Join your institution's verified grievance network</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`py-2 rounded-lg transition ${role === 'STUDENT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Student Account
          </button>
          <button
            type="button"
            onClick={() => setRole('STAFF')}
            className={`py-2 rounded-lg transition ${role === 'STAFF' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Department Staff
          </button>
        </div>

        {submitError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Step 1: College Code Verification */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Official College Code *</label>
              <button
                type="button"
                onClick={() => {
                  setCollegeCode('APEX-TECH');
                  handleVerifyCode('APEX-TECH');
                }}
                className="text-[11px] text-brand-600 font-semibold hover:underline"
              >
                Use Demo Code (APEX-TECH)
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={collegeCode}
                onChange={(e) => {
                  setCollegeCode(e.target.value.toUpperCase());
                  setVerifiedInstitution(null);
                  setCodeLookupError('');
                }}
                placeholder="e.g. APEX-TECH"
                className="flex-1 text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none uppercase font-mono"
              />
              <button
                type="button"
                onClick={() => handleVerifyCode()}
                disabled={codeLookupLoading || !collegeCode.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
              >
                {codeLookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </button>
            </div>

            {/* Verification Result Preview */}
            {verifiedInstitution && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold">{verifiedInstitution.name}</span>
                  <span className="text-[10px] text-emerald-600 ml-1">({verifiedInstitution.code}) Verified</span>
                </div>
              </div>
            )}

            {codeLookupError && (
              <p className="mt-1.5 text-[11px] text-rose-600 font-medium">{codeLookupError}</p>
            )}
          </div>

          {/* User Details */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
                className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Johnson"
                className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex.j2024"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official College Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@apex.edu"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-[11px] text-amber-800 text-left">
            ℹ️ Registrations are reviewed by your College Administrator. You will receive access upon approval.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? 'Submitting Registration...' : 'Submit Application'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
