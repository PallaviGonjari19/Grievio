# Grievio REST API Specification (Phase 1 Baseline)

Base URL: `/api/v1`  
Health Endpoint: `/api/health/`  
Auth Scheme: `Authorization: Bearer <access_token>`

---

## 1. Health & Discovery

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health/` | Service health status, database ping, version | No |
| `GET` | `/api/v1/` | API index and registered endpoints | No |

---

## 2. Authentication & Accounts (`/api/v1/accounts/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/accounts/token/` | Obtain JWT access + refresh tokens | No |
| `POST` | `/api/v1/accounts/token/refresh/` | Refresh expired access token | No |
| `POST` | `/api/v1/accounts/register/` | Register new student or staff account | No |
| `GET` | `/api/v1/accounts/me/` | Current user profile, role, & institution | Yes |
| `POST` | `/api/v1/accounts/logout/` | Blacklist refresh token & terminate session | Yes |

---

## 3. Institutions (`/api/v1/institutions/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/institutions/lookup/?code={code}` | Verify college code & fetch public profile | No |
| `GET` | `/api/v1/institutions/current/` | Fetch current authenticated institution details | Yes (Admin/Staff/Student) |
| `GET` | `/api/v1/institutions/locations/` | List campus blocks, floors, and rooms | Yes |

---

## 4. Departments & Categories (`/api/v1/departments/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/departments/` | List departments for active institution | Yes |
| `GET` | `/api/v1/departments/{id}/categories/`| List grievance categories under department | Yes |

---

## 5. Complaints Lifecycle (`/api/v1/complaints/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/complaints/` | List complaints (filtered by user role & tenant) | Yes |
| `POST` | `/api/v1/complaints/` | Submit a new grievance (Students only) | Yes (Student) |
| `GET` | `/api/v1/complaints/{id}/` | Retrieve full complaint details, history & media | Yes |
| `PATCH`| `/api/v1/complaints/{id}/status/` | Update ticket status with resolution proof | Yes (Staff/Admin) |
| `POST` | `/api/v1/complaints/{id}/comments/`| Add student/staff communication note | Yes |
| `POST` | `/api/v1/complaints/{id}/reopen/` | Dispute resolution and request reopening | Yes (Student) |

---

## 6. Notifications & Reporting (`/api/v1/notifications/`, `/api/v1/reporting/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/notifications/` | List user in-app notifications | Yes |
| `PATCH`| `/api/v1/notifications/{id}/read/` | Mark notification as read | Yes |
| `GET` | `/api/v1/reporting/dashboard/` | Institution analytics (SLA, open/closed count) | Yes (Admin) |
