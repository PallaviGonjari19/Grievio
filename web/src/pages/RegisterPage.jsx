import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, ShieldCheck, Mail, User, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('student');
  const [collegeCode, setCollegeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    alert(`Phase 1 Registration Scaffold: Registration endpoint /api/v1/accounts/register/ configured. Full verification will be activated in Phase 2.`);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Registration</h2>
          <p className="text-xs text-slate-500">Join your institution's Grievio resolution network</p>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-[11px] text-amber-800 text-left">
            ℹ️ <strong>Approval Notice:</strong> Registrations are placed in <em>Pending Approval</em> status and must be verified by your College Administrator before accessing grievance submission.
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Code</label>
            <input
              type="text"
              required
              value={collegeCode}
              onChange={(e) => setCollegeCode(e.target.value)}
              placeholder="e.g. HARVARD or IIT-DEL"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official College Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@college.edu"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Roll Number / Staff ID</label>
            <input
              type="text"
              required
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 2025MECH102"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            Submit for Institution Verification
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

