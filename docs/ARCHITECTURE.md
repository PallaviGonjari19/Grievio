# Grievio System Architecture & Security Design

## 1. Multi-Tenant Architectural Pattern

Grievio is engineered as a shared-database, shared-schema multi-tenant platform with row-level logical separation. This approach allows high resource utilization across colleges while preserving strict boundaries between institutions.

### Data Isolation Principles
1. **Tenant Anchor**: The `Institution` model is the tenant anchor entity.
2. **Discriminator Invariant**: Every business model (`Department`, `CampusLocation`, `ComplaintCategory`, `Complaint`, `Notification`) has a foreign key to `Institution`.
3. **ORM Scoping**: Every query in the Django REST Framework viewsets enforces `filter(institution=request.user.institution)` unless the user is a verified global `SUPERADMIN`.
4. **Student Privacy Protection**: A student user cannot query, read, or comment on any grievance where `student_id != request.user.id`.
5. **Department Staff Boundary**: Department technicians can only access tickets assigned to their specific department within their own institution.

---

## 2. Layered Architecture

```
+-------------------------------------------------------+
|                   Client Tier                         |
|   React Web (Tailwind)  /  React Native Expo Mobile   |
+---------------------------+---------------------------+
                            | (HTTP/JSON + Bearer JWT)
+---------------------------v---------------------------+
|                   Gateway Tier                        |
|             CORS & Security Middleware                |
+---------------------------+---------------------------+
                            |
+---------------------------v---------------------------+
|                   Django Core API                     |
|  [REST Framework] -> [JWT Auth] -> [Tenant Permissions]|
|                                                       |
|  Apps:                                                |
|  - accounts      : User accounts, Profiles, RBAC      |
|  - institutions  : Tenants, Campuses, Buildings       |
|  - departments   : Departments, Categories, SLAs      |
|  - complaints    : Grievance state engine & timeline  |
|  - notifications : Push & in-app alerts               |
|  - reporting     : Aggregated operational analytics   |
+---------------------------+---------------------------+
                            |
+---------------------------v---------------------------+
|                   Persistence Tier                    |
|             PostgreSQL Relational DB                  |
+-------------------------------------------------------+
```

---

## 3. Role-Based Access Control (RBAC) Specification

| Permission Check | Student | Department Staff | College Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| Register with College Code | Yes | Pending Approval | By Super Admin | Direct Setup |
| Raise Grievance | Yes | No | No | No |
| View Own Grievances | Yes | Assigned Dept | All in College | All Platform |
| Update Status & Add Resolution Proof | No | Yes | Yes | Yes |
| Manage College Settings & Staff | No | No | Yes | Yes |
| Provision New Institutions | No | No | No | Yes |

---

## 4. Media & Storage Security

All attachments (evidence photos, proof of resolution) undergo:
1. Extension and MIME type validation.
2. Unique UUID file naming to prevent file path traversal.
3. Storage isolation path: `uploads/institutions/{institution_id}/complaints/{complaint_id}/{filename}`.
