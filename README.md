# Grievio

<div align="center">
  <h3>Every concern deserves a resolution.</h3>
  <p>Multi-institution Campus Grievance and Facility Maintenance Management Platform</p>
</div>

---

## 🏛️ About Grievio

**Grievio** is a multi-tenant SaaS platform purpose-built for colleges, universities, and educational institutions. It empowers campus communities by transforming chaotic and informal complaint channels into a transparent, accountable, and auditable grievance resolution lifecycle.

Whether it is a broken projector in a lecture hall, a plumbing leak in a hostel, or a departmental scheduling grievance, Grievio connects students, department technicians, and college leadership through unified Web and Native Mobile interfaces.

---

## 🔒 7 Core Architectural Principles (Enforced)

1. **Centralized Multi-Institution Architecture**:
   - Multiple colleges operate on one centralized platform.
   - Each college has a unique ID, college code, students, staff, departments, categories, locations, complaints, and admin dashboards.
   - Strict tenant isolation ensures zero cross-institution data exposure.

2. **Student Registration & Administrative Approval**:
   - Students register using their institution's unique college code and college credentials.
   - All new registrations receive a `Pending Approval` (`PENDING`) status.
   - The respective College Administrator must approve or reject registrations.
   - Pending and rejected users are blocked by server-side guards (`IsApprovedUser`) from accessing protected grievance features.

3. **Department Staff Governance**:
   - Staff accounts are authorized and provisioned by the College Administrator.
   - Each staff member is bound to a specific institution and department.
   - Staff can access grievances assigned to their department or specifically assigned to them.
   - Staff are strictly prevented from querying unrelated institutions' data.

4. **Dual-Role Mobile Application (iOS & Android)**:
   - Built with React Native & Expo Router.
   - **Students**: Raise complaints, upload photos, track progress, comment, and receive notifications.
   - **Department Staff**: View assigned tickets, update statuses, record technician progress notes, and upload photo proof of resolution.

5. **Quad-Role Web Application**:
   - Built with React.js, Vite, and Tailwind CSS.
   - Supports **Student**, **Department Staff**, **College Administrator**, and **Platform Super Administrator**.

6. **Platform Super Admin vs College Admin Separation**:
   - **Platform Super Administrator**: Operates at the platform level to onboard colleges, approve institutions, manage institution admins, and control college status (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`).
   - **College Administrator**: Operates within their own institution to manage campus departments, categories, locations, approvals, and complaint workflows.

7. **Strict Security & Tenancy Invariant**:
   - Every institution-owned database record has an enforced foreign key to `Institution`.
   - The backend validates tenant access exclusively via `request.user.institution`.
   - Institution IDs supplied by frontend requests are never trusted.
   - Server-side role-based access control (RBAC) protects complaint ownership and department boundaries.

---

## 🚀 Key Capabilities by Role

- 🎓 **Students (Web & Mobile)**: Instant complaint registration, photo proof upload, campus location tagging (block, floor, room), real-time status tracker, interactive resolution chat, and closure confirmation.
- 🛠️ **Department Staff (Web & Mobile)**: Department inbox, assignment management, status progression (*Acknowledged ➔ In Progress ➔ Resolved*), internal notes, and photographic proof of repair.
- 🏫 **College Administrators (Web)**: Institution configuration, department & staff management, student/staff registration approvals, category SLAs, cross-department reassignment, escalation alerts, and turnaround analytics.
- 🌐 **Platform Super Admins (Web)**: College onboarding and approvals, tenant isolation oversight, college suspension/activation, and platform-wide telemetry.

---

## 📁 Repository Structure

```text
Grievio/
├── backend/                  # Django & Django REST Framework Core API
│   ├── config/               # Project configuration (settings, urls, wsgi/asgi)
│   ├── accounts/             # Authentication, Users, Approval Queue & RBAC
│   ├── institutions/         # Tenant models, Campuses, Buildings & Locations
│   ├── departments/          # College departments, Categories & SLA rules
│   ├── complaints/           # Grievance lifecycle, Attachments, Comments & Timeline
│   ├── notifications/        # In-app notifications & alerts
│   ├── reporting/            # Analytical reports & SLA metrics
│   ├── manage.py             # Django management CLI
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment template
├── web/                      # React Web Application (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Reusable UI components & layouts
│   │   ├── pages/            # View pages (Landing, Login, Register, etc.)
│   │   ├── services/         # Axios API clients & interceptors
│   │   ├── App.jsx           # Root application routing
│   │   └── main.jsx          # Entrypoint & styling
│   ├── package.json          # Web dependencies
│   ├── vite.config.js        # Vite bundler config
│   ├── tailwind.config.js    # Grievio theme config
│   └── .env.example          # Web environment template
├── mobile/                   # React Native Mobile Application (Expo SDK 58)
│   ├── app/                  # Expo Router file-based screens (_layout, index, login, register)
│   ├── src/
│   │   ├── constants/        # Theme & design tokens
│   │   └── services/         # Mobile Axios API client
│   ├── package.json          # Mobile dependencies
│   ├── app.json              # Expo application manifest
│   └── .env.example          # Mobile environment template
├── docs/                     # Architecture & API documentation
│   ├── ARCHITECTURE.md       # High-level architecture and tenant isolation
│   └── API_OVERVIEW.md       # REST endpoints overview
├── PROJECT_PLAN.md           # Engineering roadmap & domain specifications
├── README.md                 # Project handbook & getting started guide
└── .gitignore                # Global ignore rules
```

---

## ⚙️ Technology Stack

| Layer | Stack |
| :--- | :--- |
| **Backend** | Python 3.14, Django 5+, Django REST Framework, Simple JWT, Django CORS Headers |
| **Database** | PostgreSQL 16+ (resilient fallback to SQLite for local bootstrap) |
| **Web** | React 18+, Vite, JavaScript, Tailwind CSS, React Router v6, Axios, Lucide React |
| **Mobile** | React Native, Expo SDK 58, JavaScript, Expo Router, Axios |
| **Security** | Multi-tenant tenant discrimination, JWT authentication, Role-based access control (RBAC), Approval Queue |

---

## 🛠️ Quickstart & Local Setup

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Virtual environment is located at backend/venv
.\venv\Scripts\Activate.ps1   # On Windows
# or: source venv/bin/activate # On Linux/macOS

# Run automated tests
python manage.py test

# Start development server
python manage.py runserver 0.0.0.0:8000
```
- API Base: `http://localhost:8000/api/v1/`
- Health Probe: `http://localhost:8000/api/health/`
- Django Admin: `http://localhost:8000/admin/`

### 2. Web Setup
```bash
# Navigate to web
cd web

# Start Vite dev server
npm run dev
```
Web client will be available at `http://localhost:5173`.

### 3. Mobile Setup
```bash
# Navigate to mobile
cd mobile

# Start Expo dev server
npx expo start
```
Scan the QR code with **Expo Go** on Android or iOS.

---

## 🧪 Verification Status

- **Backend Tests**: 6/6 tests passing (`python manage.py test`) verifying health check, JWT auth, registration approval workflow, student ticket isolation, and cross-tenant boundaries.
- **Web Build**: Successfully compiled with zero errors (`npm run build`).
- **Mobile Validation**: Expo SDK 58 configuration validated (`npx expo config --type public`).

---

## 📄 License
Internal proprietary release for Grievio Campus Grievance Platform. All rights reserved.
