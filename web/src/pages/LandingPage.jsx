import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Users, 
  Smartphone, 
  Layers, 
  ArrowRight, 
  FileText, 
  UploadCloud, 
  BellRing, 
  BarChart3, 
  Check, 
  Activity,
  AlertTriangle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { checkSystemHealth } from '../services/api';

export default function LandingPage() {
  const [healthStatus, setHealthStatus] = useState({ checking: true, online: false });
  const [activeRoleTab, setActiveRoleTab] = useState('student');

  useEffect(() => {
    checkSystemHealth().then((res) => {
      setHealthStatus({ checking: false, online: res.online, data: res.data });
    });
  }, []);

  const roles = [
    {
      id: 'student',
      title: 'Students',
      subtitle: 'Effortless Grievance Reporting',
      badge: 'Zero Friction',
      icon: Users,
      description: 'Log campus issues in seconds using an institution code. Attach photos, tag specific locations, and track resolution step-by-step.',
      features: [
        'Photo and document attachment upload',
        'Specific location tagging (Block, Floor, Lab)',
        'Live timeline updates and status notifications',
        'Direct resolution feedback & reopening dispute option'
      ],
      ctaText: 'Access Student Portal',
      ctaLink: '/login?role=student'
    },
    {
      id: 'staff',
      title: 'Department Staff',
      subtitle: 'Actionable Maintenance Queues',
      badge: 'Rapid Resolution',
      icon: Clock,
      description: 'Departmental staff receive assigned tickets instantly with full context, evidence photos, and direct student communication.',
      features: [
        'Dedicated department ticket queues',
        'Multi-stage status progression',
        'Upload photo proof of completed repair',
        'Internal department discussion notes'
      ],
      ctaText: 'Staff Login',
      ctaLink: '/login?role=staff'
    },
    {
      id: 'admin',
      title: 'College Administrators',
      subtitle: 'Complete Institutional Oversight',
      badge: 'Executive Control',
      icon: Building2,
      description: 'Gain holistic oversight of campus maintenance health, SLA breaches, staff workloads, and satisfaction metrics across departments.',
      features: [
        'Manage departments, staff accounts & categories',
        'Real-time SLA tracking and overdue alerts',
        'Cross-department ticket reassignment',
        'Exportable campus analytics and turnaround metrics'
      ],
      ctaText: 'Admin Console',
      ctaLink: '/login?role=admin'
    },
    {
      id: 'superadmin',
      title: 'Platform Super Admin',
      subtitle: 'Multi-Tenant Governance',
      badge: 'Global Scale',
      icon: ShieldCheck,
      description: 'Centrally onboard educational institutions, manage tenant domains, monitor infrastructure health, and enforce strict data boundaries.',
      features: [
        'Instant college onboarding with unique codes',
        'Strict tenant-level logical data isolation',
        'Platform-wide audit logging and system telemetry',
        'Subscription & institutional quota controls'
      ],
      ctaText: 'Super Admin Gateway',
      ctaLink: '/login?role=superadmin'
    }
  ];

  const currentRole = roles.find((r) => r.id === activeRoleTab);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-50/70 via-slate-50/30 to-transparent -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Tag & Backend Status */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs text-xs font-medium text-slate-700">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${healthStatus.online ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${healthStatus.online ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span>
              {healthStatus.checking 
                ? 'Verifying API status...' 
                : healthStatus.online 
                  ? 'Grievio Core API Connected' 
                  : 'Backend API Standing By'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-brand-600 font-semibold">Multi-Tenant v1.0</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Every concern deserves a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                resolution.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              The modern campus grievance and facility maintenance platform. Connecting students, technicians, and college administrators in one accountable, auditable ecosystem.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 px-6 py-3.5 rounded-xl shadow-md shadow-brand-600/20 transition-all hover:scale-[1.01]"
            >
              Onboard Your Institution
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-6 py-3.5 rounded-xl shadow-xs transition"
            >
              Sign In to Portal
            </Link>
          </div>

          {/* Highlights / Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-500 font-medium">Tenant Data Isolation</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <p className="text-2xl font-bold text-slate-900">&lt; 24h</p>
              <p className="text-xs text-slate-500 font-medium">Standard SLA Target</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <p className="text-2xl font-bold text-slate-900">Web & App</p>
              <p className="text-xs text-slate-500 font-medium">Responsive & Expo Native</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <p className="text-2xl font-bold text-slate-900">End-to-End</p>
              <p className="text-xs text-slate-500 font-medium">Audited Issue Lifecycle</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Tabs Section */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-brand-600 uppercase">Multi-Stakeholder Experience</h2>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Engineered for every campus role</h3>
          <p className="text-slate-600 text-sm">
            Distinct, purpose-built interfaces tailored to each stakeholder’s responsibilities and access boundaries.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1.5 bg-slate-100/90 rounded-2xl max-w-2xl mx-auto">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRoleTab(role.id)}
              className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                activeRoleTab === role.id
                  ? 'bg-white text-slate-900 shadow-sm shadow-slate-300/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {role.title}
            </button>
          ))}
        </div>

        {/* Tab Card */}
        {currentRole && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto transition-all">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-xs font-medium border border-brand-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentRole.badge}
                </div>
                <h4 className="text-2xl font-bold text-slate-900">{currentRole.subtitle}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{currentRole.description}</p>
                
                <ul className="space-y-2.5 pt-2">
                  {currentRole.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Link
                    to={currentRole.ctaLink}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700 group"
                  >
                    <span>{currentRole.ctaText}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5 bg-slate-50 rounded-xl p-6 border border-slate-100 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-brand-600">
                  <currentRole.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{currentRole.title} Console</p>
                  <p className="text-[11px] text-slate-500 mt-1">Built with granular role-based permissions</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-left text-[11px] text-slate-600 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auth Token:</span>
                    <span className="text-emerald-600 font-semibold">JWT Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Access Scope:</span>
                    <span className="text-slate-800 font-semibold">{currentRole.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Isolation:</span>
                    <span className="text-brand-600 font-semibold">Row-Level (Tenant)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Lifecycle / How It Works */}
      <section id="workflow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-brand-600 uppercase">Transparent Pipeline</h2>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">The 5-Stage Resolution Engine</h3>
          <p className="text-slate-600 text-sm">
            Eliminating unacknowledged complaints through enforced accountability from filing to closure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Submit', desc: 'Student selects category, tags location & uploads photo proof.' },
            { step: '02', title: 'Acknowledge', desc: 'Department automatically triages and validates ticket urgency.' },
            { step: '03', title: 'Assign & Action', desc: 'Staff technician assigned; work initiated on campus.' },
            { step: '04', title: 'Resolve with Proof', desc: 'Technician uploads photographic evidence of completion.' },
            { step: '05', title: 'Close or Reopen', desc: 'Student confirms resolution satisfaction or requests review.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs relative space-y-3">
              <span className="text-xs font-black text-brand-600/80 font-mono tracking-widest">{item.step}</span>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Enterprise Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-brand-600 uppercase">Architecture Highlights</h2>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Enterprise Infrastructure</h3>
          <p className="text-slate-600 text-sm">
            Built from day one for institutional reliability, data privacy, and audit compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Multi-Tenant Isolation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every college operates in strict logical partition. No student, staff member, or administrator can access complaints from external institutions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">SLA & Escalation Engine</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Define resolution deadlines per department and urgency level. Overdue complaints trigger automatic escalation warnings to college leadership.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Web & Native Mobile Parity</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Responsive React Web console for campus desks paired with React Native / Expo iOS and Android apps for students and on-site technicians.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl shadow-brand-600/20">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-3xl font-bold tracking-tight">Ready to modernize your campus grievance system?</h3>
            <p className="text-brand-100 text-sm">
              Deploy Grievio across your departments, hostels, and academic blocks in days.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition shadow-sm"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:contact@grievio.internal"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-700/60 text-white font-medium px-6 py-3 rounded-xl hover:bg-brand-700 transition border border-brand-500"
            >
              Contact Solutions Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
