import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Heart, Github, Building2, Smartphone, ArrowRight } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/?section=${sectionId}`);
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs group-hover:bg-brand-700 transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition">Grievio</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every concern deserves a resolution. Multi-institution campus grievance, facility repair & maintenance workflow platform.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                v2.0 Production Ready
              </span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('features')}
                  className="hover:text-brand-600 transition cursor-pointer text-left"
                >
                  Feature Tour
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('workflow')}
                  className="hover:text-brand-600 transition cursor-pointer text-left"
                >
                  5-Stage Resolution Engine
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('roles')}
                  className="hover:text-brand-600 transition cursor-pointer text-left"
                >
                  Role Access Matrix
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('apps')}
                  className="hover:text-brand-600 transition cursor-pointer text-left flex items-center gap-1"
                >
                  <span>Mobile Apps (iOS/Android)</span>
                  <Smartphone className="w-3 h-3 text-brand-600" />
                </button>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Campus Portals</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <Link to="/login?role=student" className="hover:text-brand-600 transition">
                  Student Grievance Portal
                </Link>
              </li>
              <li>
                <Link to="/login?role=staff" className="hover:text-brand-600 transition">
                  Department Staff Workbench
                </Link>
              </li>
              <li>
                <Link to="/login?role=admin" className="hover:text-brand-600 transition">
                  College Administrator Console
                </Link>
              </li>
              <li>
                <Link to="/login?role=superadmin" className="hover:text-brand-600 transition">
                  Platform Super Admin Gateway
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('institutions')}
                  className="hover:text-brand-600 transition cursor-pointer text-left flex items-center gap-1 font-bold text-brand-600 pt-1"
                >
                  <span>College Code Lookup &rarr;</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Security & Trust</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Multi-Tenant Row Isolation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Strict Student Privacy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Automated SLA Escalation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Cryptographic Audit Timelines</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Grievio Platform. Multi-institution campus governance ecosystem.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleNavClick('institutions')}
              className="text-slate-600 hover:text-brand-600 transition cursor-pointer"
            >
              For Colleges
            </button>
            <span>&bull;</span>
            <Link to="/register" className="text-slate-600 hover:text-brand-600 transition">
              Student Registration
            </Link>
            <span>&bull;</span>
            <Link to="/login" className="text-slate-600 hover:text-brand-600 transition">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
