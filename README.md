# Grievio

<div align="center">
  <h3>Every concern deserves a resolution.</h3>
  <p>Multi-institution Campus Grievance and Maintenance Management Platform</p>
</div>

---

## 🏛️ About Grievio

**Grievio** is a multi-tenant SaaS platform purpose-built for colleges, universities, and educational institutions. It empowers campus communities by transforming chaotic and informal complaint channels into a transparent, accountable, and auditable grievance lifecycle.

Whether it is a broken projector in a lecture hall, a plumbing leak in a hostel, or a departmental scheduling grievance, Grievio connects students, department technicians, and college leadership through unified Web and Mobile interfaces.

---

## 🚀 Key Capabilities by Role

- 🎓 **Students**: Instant mobile or web complaint registration, photo proof upload, campus location tagging (block, floor, room), real-time status tracker, interactive resolution chat, and closure confirmation.
- 🛠️ **Department Staff**: Centralized department inbox, assignment management, status progression (Acknowledged ➔ In Progress ➔ Resolved), internal notes, and photographic proof of repair.
- 🏫 **College Administrators**: Institution configuration, department & staff management, category SLAs, cross-department reassignment, escalation alerts, and turnaround analytics.
- 🌐 **Platform Super Admins**: College onboarding, tenant isolation oversight, and platform health monitoring.

---

## 📁 Repository Structure

```text
Grievio/
├── backend/                  # Django & Django REST Framework Core API
│   ├── config/               # Project configuration (settings, urls, wsgi)
│   ├── accounts/             # Authentication, Users, Profiles & RBAC
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
│   │   ├── pages/            # View pages (Landing, Login, Dashboard, etc.)
│   │   ├── services/         # Axios API clients & interceptors
│   │   ├── context/          # React context providers (Auth, Tenant)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Helper utilities and formatters
│   │   ├── App.jsx           # Root application component
│   │   └── main.jsx          # Entrypoint & routing
│   ├── package.json          # Web dependencies
│   └── .env.example          # Web environment template
├── mobile/                   # React Native Mobile Application (Expo)
│   ├── app/                  # Expo Router file-based screens
│   ├── src/
│   │   ├── components/       # Mobile UI components
│   │   ├── services/         # Mobile Axios API clients
│   │   ├── context/          # State management
│   │   └── constants/        # Theme & API configuration
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
| **Backend** | Python 3.12+, Django 5+, Django REST Framework, Simple JWT, Django CORS Headers |
| **Database** | PostgreSQL 16+ (resilient fallback to SQLite for local bootstrap) |
| **Web** | React 18+, Vite, JavaScript, Tailwind CSS, React Router v6, Axios, Lucide React |
| **Mobile** | React Native, Expo SDK, JavaScript, Expo Router, Axios |
| **Security** | Multi-tenant tenant discrimination, JWT authentication, Role-based access control (RBAC) |

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- **Python**: 3.12 or higher (`python --version`)
- **Node.js**: 18.x or higher (`node --version`)
- **npm**: 9.x or higher (`npm --version`)
- **PostgreSQL**: (Optional for local test run, required for staging/prod)

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database migrations
python manage.py migrate

# Start Django development server
python manage.py runserver 0.0.0.0:8000
```
Backend API will be live at `http://localhost:8000/api/v1/`. Health check endpoint: `http://localhost:8000/api/health/`.

### 3. Web Setup
```bash
# Navigate to web
cd web

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Vite dev server
npm run dev
```
Web client will be available at `http://localhost:5173`.

### 4. Mobile Setup
```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Expo dev server
npx expo start
```
Scan the QR code with **Expo Go** on Android or iOS.

---

## 🔐 Security & Data Isolation
- **Tenant Scope Enforcement**: All complaints, categories, and campus locations are linked to an `Institution`.
- **RBAC**: Students can only access their own submissions; Staff are restricted to their department; College Admins are restricted to their institution.
- **Tokens**: Access tokens rotate via SimpleJWT with secure expiration and refresh logic.

---

## 📄 License
Internal proprietary release for Grievio Campus Grievance Platform. All rights reserved.
