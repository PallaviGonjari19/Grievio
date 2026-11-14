# Grievio — Phase 1 Code-Level Audit & Security Report

> **Auditor Role:** Senior QA Engineer & Backend Security Architect  
> **Repository:** Grievio Multi-Institution Grievance & Maintenance Management Platform  
> **Date:** November 14, 2026  
> **Status:** Code-Level Audit Complete (15/15 Automated Tests Passing)

---

## 1. Executive Summary

This audit delivers an exhaustive, code-level verification of the Grievio Phase 1 scaffold across the **Backend (Django 5 + DRF + SimpleJWT)**, **Web Client (React + Vite + Tailwind)**, and **Mobile Client (React Native + Expo SDK 58)**.

All audit tests and checks were executed directly against the local runtime and virtual environments. During the audit, 5 critical security loopholes and 1 routing issue were uncovered, safely corrected, and verified with 15 automated test cases without altering the agreed architectural model.

---

## 2. Database Connection Status

### PostgreSQL & SQLite Runtime Status
- **PostgreSQL Service**: The Windows service `postgresql-x64-18` is running locally on port 5432.
- **Python Driver**: `psycopg` (v3.3.9 binary wheel) is installed and operational.
- **Connection Test Execution**:
  ```python
  conn = psycopg.connect('dbname=postgres user=postgres password=postgres host=localhost port=5432')
  ```
  **Result**: `FATAL: password authentication failed for user "postgres"`.  
  *Finding*: The local PostgreSQL service is running, but user credentials differ from the standard development placeholder (`postgres:postgres`).
- **Resilient Fallback**: [`backend/config/settings.py`](file:///c:/Users/DELL/Desktop/Grievio/backend/config/settings.py) dynamically checks `DB_ENGINE`. Since `DB_ENGINE=sqlite` is specified in `backend/.env`, Django successfully bootstrapped and applied all 36 migrations to `backend/db.sqlite3`.
- **Recommendation**: To connect to the local PostgreSQL instance, the user should provide their configured PostgreSQL password in `backend/.env`:
  ```ini
  DB_ENGINE=postgresql
  DB_NAME=grievio_db
  DB_USER=postgres
  DB_PASSWORD=<actual_installed_postgres_password>
  DB_HOST=localhost
  DB_PORT=5432
  ```

---

## 3. Security Vulnerabilities Identified & Resolved

During the audit, five critical privilege and data-isolation vulnerabilities were uncovered and immediately patched:

### Vulnerability 1: Direct Administrative Privilege Escalation (CRITICAL)
- **Problem**: `RegisterSerializer` accepted arbitrary `role` input (e.g., `role: "SUPERADMIN"` or `"ADMIN"`) directly from unauthenticated public POST requests to `/api/v1/accounts/register/`. An attacker could self-register as a Platform Super Administrator or College Administrator and bypass all verification.
- **Resolution**:
  - Constrained `role` choices in `RegisterSerializer` exclusively to `UserRole.STUDENT` and `UserRole.STAFF`.
  - Added explicit validation rejecting any administrative role registration with `400 Bad Request`.
  - Enforced that all self-registered accounts are hardcoded to `approval_status = ApprovalStatus.PENDING` and `is_verified = False`.
  - Verified with test `test_privilege_escalation_prevented`.

### Vulnerability 2: Cross-Tenant Foreign Key Injection in Grievance Creation (HIGH)
- **Problem**: In `ComplaintDetailSerializer`, the fields `department`, `category`, and `location` accepted primary keys from any institution. A student from College Alpha could submit a grievance linked to a department in College Beta, compromising relational multi-tenancy.
- **Resolution**:
  - Implemented `validate()` in `ComplaintDetailSerializer` that verifies:
    1. `department.institution == request.user.institution`
    2. `category.department == department` (and belongs to the user's institution)
    3. `location.institution == request.user.institution` (if provided)
  - Verified with test `test_cross_tenant_foreign_key_injection_prevented`.

### Vulnerability 3: Unauthorized Department & Campus Location Creation (HIGH)
- **Problem**: `DepartmentListView` and `CampusLocationListView` used basic `IsAuthenticated` permissions on `ListCreateAPIView`. Any authenticated student could issue a POST request to create arbitrary college departments, complaint categories, and campus blocks.
- **Resolution**:
  - Created `IsCollegeAdminOrReadOnly` in [`backend/accounts/permissions.py`](file:///c:/Users/DELL/Desktop/Grievio/backend/accounts/permissions.py).
  - Applied `IsCollegeAdminOrReadOnly` to `DepartmentListView`, `DepartmentCategoriesListView`, and `CampusLocationListView`.
  - Approved students and staff receive read access (`GET`), while write access (`POST`, `PUT`, `DELETE`) is restricted exclusively to College Administrators and Platform Super Admins.
  - Verified with test `test_student_cannot_create_department`.

### Vulnerability 4: Cross-Department Staff Interaction on Grievances (MEDIUM)
- **Problem**: Staff technicians from unrelated departments (e.g., Plumbing) were able to comment or upload files to tickets in other departments (e.g., Electrical) within the same college.
- **Resolution**:
  - Implemented `check_complaint_access(user, complaint)` in [`backend/complaints/views.py`](file:///c:/Users/DELL/Desktop/Grievio/backend/complaints/views.py).
  - Department staff are strictly restricted to tickets where:
    `complaint.department == user.staff_profile.department` OR `complaint.assigned_staff == user`.
  - Verified with test `test_staff_cannot_comment_on_unrelated_department`.

### Vulnerability 5: Suspended Institution Access Leak (MEDIUM)
- **Problem**: If an institution was suspended by the Platform Super Admin (`Institution.status = SUSPENDED`), previously approved students and staff could still query complaints because `is_approved()` only checked the user's individual approval flag.
- **Resolution**:
  - Updated `User.is_approved()` in [`backend/accounts/models.py`](file:///c:/Users/DELL/Desktop/Grievio/backend/accounts/models.py) to verify that `self.institution and self.institution.is_active`. If a college is suspended, all non-superadmin users are blocked immediately with `403 Forbidden`.
  - Verified with test `test_suspended_institution_blocks_access`.

---

## 4. Root Path (404) Analysis & Resolution

### Root Cause
When opening `http://127.0.0.1:8000/` in the browser, Django rendered a `Page not found (404)` debug screen because the root path `""` was unmapped in `config/urls.py` (the API endpoints were located at `/api/v1/`, `/api/health/`, and `/admin/`).

### Resolution Applied
Added `root_index` in [`backend/config/urls.py`](file:///c:/Users/DELL/Desktop/Grievio/backend/config/urls.py):
```python
def root_index(request):
    return JsonResponse({
        "platform": "Grievio",
        "tagline": "Every concern deserves a resolution.",
        "description": "Multi-institution Campus Grievance and Maintenance Platform Core API",
        "status": "online",
        "version": "1.0.0",
        "web_client": "http://localhost:5173",
        "endpoints": {
            "health": "/api/health/",
            "api_root": "/api/v1/",
            "admin": "/admin/",
            ...
        }
    })
```
Visiting `http://127.0.0.1:8000/` now returns HTTP 200 with complete discovery and status metadata.

---

## 5. Feature Status Breakdown

### 5.1 Verified Working Features (Fully Tested)
- **Health Probe**: `GET /api/health/` returns database status (`ok`) and service state (`online`).
- **API Root**: `GET /` and `GET /api/v1/` return JSON endpoint discovery.
- **Registration**: `POST /api/v1/accounts/register/` creates student/staff accounts defaulting to `PENDING` approval.
- **Privilege Protection**: Registration rejects attempts to register as `ADMIN` or `SUPERADMIN`.
- **Institution Code Validation**: Registration rejects inactive, non-existent, or suspended college codes.
- **Approval Workflow**: College Administrators can list pending registrations (`GET /api/v1/accounts/pending-users/`) and approve/reject them (`POST /api/v1/accounts/users/<id>/approve/`).
- **Student Privacy & Isolation**: Students can strictly only view complaints they created; cross-student and cross-college queries return zero records.
- **Department Staff Queues**: Staff only access complaints matching their assigned department or explicitly assigned to their user account.
- **Cross-Department Protection**: Unassigned staff from different departments cannot comment or alter tickets.
- **JWT Token Issuance & Refresh**: `/api/v1/accounts/token/` and `/api/v1/accounts/token/refresh/`.
- **Token Blacklisting**: `/api/v1/accounts/logout/` blacklists refresh tokens, preventing replay attacks.
- **Password Security**: Passwords are securely hashed with `pbkdf2_sha256` (870,000 iterations).
- **Web Frontend Build**: Vite + React + Tailwind builds cleanly with 0 errors (`dist/index.html` generated in 4.94s).
- **Mobile Expo Config**: Validated against Expo SDK 58.0.0 with file-based routing.

### 5.2 Features That Exist But Are Incomplete (Phase 1 Baseline)
- **Web Auth Integration**: The web login and registration pages currently trigger Phase 1 prototype alerts instead of storing JWT tokens in `localStorage`. Full Redux/Context auth state will be wired in Phase 2.
- **Mobile Auth Integration**: The mobile login and registration screens display prototype alert dialogues instead of persisting JWT tokens to secure storage.
- **Media Upload Pipeline**: Complaint attachments support model and serializer file uploads, but S3/cloud storage backend configuration is slated for Phase 3.

### 5.3 Features That Are Only Documented (Scheduled for Future Phases)
- **SLA Breach Auto-Escalation**: Documented in `PROJECT_PLAN.md` (Celery background worker scheduled for Phase 4).
- **Push Notification Delivery**: Documented in `PROJECT_PLAN.md` (Expo push notifications scheduled for Phase 4).
- **Dedicated Super Admin Frontend Portal**: Documented in `PROJECT_PLAN.md` (Scheduled for Phase 5; in Phase 1, superadmins use the Django Admin console).

---

## 6. Commands Executed & Actual Results

| Category | Command Line | Exit Code | Result Summary |
| :--- | :--- | :---: | :--- |
| **Backend Testing** | `python manage.py test` | `0` | **15/15 tests passed** in 29.98s (Health, Auth, Approval, Multi-Tenant Isolation, Staff RBAC, Privilege Prevention). |
| **Django System Check** | `python manage.py check` | `0` | System check identified no issues (0 silenced). |
| **Database Migrations** | `python manage.py migrate` | `0` | All 36 migrations applied cleanly. |
| **PostgreSQL Connection** | `psycopg.connect(...)` | `0` (Script) | Detected running PostgreSQL service; flagged credential mismatch; confirmed SQLite fallback. |
| **Web Production Build** | `cd web; npm run build` | `0` | Built in 4.94s; 1,564 modules transformed; assets generated. |
| **Mobile Expo Validation** | `cd mobile; npx expo config --type public` | `0` | SDK 58.0.0 configuration valid; Metro bundler recognized. |

---

## 7. Recommended Next Steps for Phase 2

1. **Phase 2 Kickoff**: Proceed with Phase 2 implementation focusing on full client-side JWT authentication state (Token storage, Auto-refresh interceptors, and Route Guards in Web and Mobile).
2. **PostgreSQL Credentials**: Update `backend/.env` with actual PostgreSQL password if switching from SQLite to PostgreSQL.
3. **Admin Setup**: Create the initial platform superadmin account via `python manage.py createsuperuser` for initial college provisioning.
