import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, Layers } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:bg-brand-700 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-brand-600 transition">
              Grievio
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              Campus v1.0
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition">Features</a>
          <a href="#roles" className="hover:text-slate-900 transition">User Roles</a>
          <a href="#workflow" className="hover:text-slate-900 transition">How It Works</a>
          <a href="#institutions" className="hover:text-slate-900 transition">For Colleges</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg shadow-sm shadow-brand-600/20 transition"
          >
            Get Started
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
