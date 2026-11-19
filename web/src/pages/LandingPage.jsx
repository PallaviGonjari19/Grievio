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
  Sparkles,
  Camera,
  Crown,
  Lock,
  ArrowUpRight,
  CheckCheck,
  MapPin,
  Wrench,
  GraduationCap
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
      icon: GraduationCap,
      description: 'Log campus issues in seconds using your unique institution code. Attach photos, tag exact lab/hostel locations, and track resolution step-by-step.',
      features: [
        'Photo and document attachment upload with live previews',
        'Specific location tagging (Building, Block, Floor, Lab)',
        'Live timeline updates and in-app bell notifications',
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
      icon: Wrench,
      description: 'Departmental technicians receive tickets instantly with full diagnostic context, evidence photos, and direct student communication.',
      features: [
        'Dedicated department triage & maintenance queues',
        'One-click ticket claiming & stage progression',
        'Upload photographic proof of completed repair',
        'Internal department discussion notes & auditing'
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
      description: 'Gain holistic oversight of campus maintenance health, SLA breaches, staff workloads, and satisfaction metrics across all faculties.',
      features: [
        'Instant student & staff registration approval portal',
        'Real-time SLA tracking and automated overdue alerts',
        'Cross-department ticket dispatch and reassignment',
        'Exportable campus turnaround metrics & audit history'
      ],
      ctaText: 'Admin Console',
      ctaLink: '/login?role=admin'
    },
    {
      id: 'superadmin',
      title: 'Platform Super Admin',
      subtitle: 'Multi-Tenant Governance',
      badge: 'Global Scale',
      icon: Crown,
      description: 'Centrally onboard educational institutions, manage tenant domains, monitor infrastructure health, and enforce strict data boundaries.',
      features: [
        'Instant college onboarding with unique codes (e.g. APEX-TECH)',
        'Strict tenant-level logical data isolation (Zero-Trust)',
        'Platform-wide audit logging and infrastructure telemetry',
        'Global registration review and tenant lifecycle controls'
      ],
      ctaText: 'Super Admin Gateway',
      ctaLink: '/login?role=superadmin'
    }
  ];

  const currentRole = roles.find((r) => r.id === activeRoleTab);

  return (
    <div className="space-y-28 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-50/70 via-slate-50/20 to-transparent -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Tag & Backend Status */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700">
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
            <span className="text-brand-600 font-bold">Multi-Tenant v2.0</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Every concern deserves a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
                resolution.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              The modern campus grievance and facility maintenance platform. Connecting students, technicians, and college administrators in one accountable, auditable ecosystem.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 px-7 py-3.5 rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Onboard Your Institution
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-7 py-3.5 rounded-xl shadow-xs transition"
            >
              Sign In to Portal
            </Link>
          </div>

          {/* Highlights / Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-2xl font-black text-slate-900">100%</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Tenant Data Isolation</p>
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-2xl font-black text-slate-900">&lt; 24h</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Guaranteed SLA Target</p>
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-2xl font-black text-slate-900">Web & App</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">React + Expo Native</p>
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-2xl font-black text-slate-900">End-to-End</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Audited Issue Lifecycle</p>
            </div>
          </div>

          {/* Interactive Live Platform Mockup Showcase */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="p-2 sm:p-4 rounded-3xl bg-slate-900/5 border border-slate-200/80 shadow-2xl backdrop-blur-md">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                {/* Mockup Header */}
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 pl-2">
                      https://grievio.internal/tickets/COEP-COMP-26-5A9EC7
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Grievance Lifecycle
                  </span>
                </div>

                {/* Mockup Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          COEP-COMP-26-5A9EC7
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          RESOLVED
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          HIGH PRIORITY
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">
                        High-Speed Wi-Fi Router Offline in Central Library Block
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        College of Engineering Pune &bull; Computer Center & IT Services &bull; Reported 2 hours ago
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">SLA Turnaround</span>
                      <span className="text-base font-black text-emerald-600">Resolved in 1.4h</span>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Stepper */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                      <p className="text-[11px] font-bold text-slate-800">1. Submitted</p>
                      <p className="text-[9px] text-slate-400">Photo Attached</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                      <p className="text-[11px] font-bold text-slate-800">2. Triaged</p>
                      <p className="text-[9px] text-slate-400">IT Assigned</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                      <p className="text-[11px] font-bold text-slate-800">3. Repaired</p>
                      <p className="text-[9px] text-slate-400">Hardware Swapped</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                      <p className="text-[11px] font-bold text-emerald-900">4. Verified</p>
                      <p className="text-[9px] text-emerald-700">Student Confirmed</p>
                    </div>
                  </div>

                  {/* Live Feedback Banner */}
                  <div className="p-3.5 rounded-xl bg-brand-50/80 border border-brand-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-brand-900 font-medium">
                      <CheckCheck className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Technician uploaded diagnostic proof. Student Pallavi confirmed satisfactory resolution.</span>
                    </div>
                    <span className="font-bold text-brand-700">Audit Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Role Tabs Section */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-brand-600 uppercase">Multi-Stakeholder Experience</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Engineered for every campus role</h3>
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
              className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-10 max-w-4xl mx-auto transition-all">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200/80">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  {currentRole.badge}
                </div>
                <h4 className="text-2xl font-extrabold text-slate-900">{currentRole.subtitle}</h4>
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
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 group"
                  >
                    <span>{currentRole.ctaText}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5 bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-brand-600">
                  <currentRole.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{currentRole.title} Console</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Role-based security & tenant row isolation</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-left text-xs text-slate-600 space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auth Token:</span>
                    <span className="text-emerald-600 font-bold">JWT Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Access Scope:</span>
                    <span className="text-slate-800 font-bold">{currentRole.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Boundary:</span>
                    <span className="text-brand-600 font-bold">Row-Level (Zero-Trust)</span>
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
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">The 5-Stage Resolution Engine</h3>
          <p className="text-slate-600 text-sm">
            Eliminating unacknowledged complaints through enforced accountability from filing to closure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Submit', desc: 'Student selects department category, tags exact location & uploads photo proof.' },
            { step: '02', title: 'Acknowledge', desc: 'System applies SLA countdown and notifies the relevant department desk.' },
            { step: '03', title: 'Assign & Action', desc: 'Department staff claims ticket; maintenance work begins on-site.' },
            { step: '04', title: 'Resolve with Proof', desc: 'Technician completes repair and uploads photographic evidence.' },
            { step: '05', title: 'Close or Reopen', desc: 'Student inspects and confirms resolution satisfaction or disputes.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-brand-200 hover:shadow-xs transition space-y-3">
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
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enterprise Infrastructure</h3>
          <p className="text-slate-600 text-sm">
            Built from day one for institutional reliability, data privacy, and audit compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-brand-200 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Multi-Tenant Isolation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every college operates in strict logical partition. No student, staff member, or administrator can access complaints from external institutions.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-brand-200 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">SLA & Escalation Engine</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Define resolution deadlines per department and urgency level. Overdue complaints trigger automatic escalation warnings to college leadership.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-brand-200 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
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
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl shadow-brand-500/20">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to modernize your campus grievance system?</h3>
            <p className="text-brand-100 text-sm leading-relaxed">
              Deploy Grievio across your departments, hostels, laboratories, and academic blocks in days.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-7 py-3.5 rounded-xl hover:bg-brand-50 transition shadow-sm cursor-pointer"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-700/60 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-brand-700 transition border border-brand-400/50 cursor-pointer"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
