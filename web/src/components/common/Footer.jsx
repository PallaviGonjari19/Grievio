import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">Grievio</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every concern deserves a resolution. Multi-institution campus grievance & maintenance management platform.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="#features" className="hover:text-slate-900 transition">Feature Tour</a></li>
              <li><a href="#workflow" className="hover:text-slate-900 transition">Resolution Lifecycle</a></li>
              <li><a href="#roles" className="hover:text-slate-900 transition">Role Access Matrix</a></li>
              <li><span className="text-slate-400">Mobile Apps (iOS/Android)</span></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Portals</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/login?role=student" className="hover:text-slate-900 transition">Student Portal</Link></li>
              <li><Link to="/login?role=staff" className="hover:text-slate-900 transition">Department Staff Portal</Link></li>
              <li><Link to="/login?role=admin" className="hover:text-slate-900 transition">College Admin Console</Link></li>
              <li><Link to="/login?role=superadmin" className="hover:text-slate-900 transition">Super Admin Gateway</Link></li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Security & Trust</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Multi-Tenant Row Isolation</li>
              <li>Strict Student Privacy</li>
              <li>SLA Escalation Engine</li>
              <li>Auditable Timelines</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Grievio Platform. Production-grade multi-institution architecture.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for campus transparency
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
