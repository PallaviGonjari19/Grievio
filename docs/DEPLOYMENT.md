# Grievio — Production Deployment & Operations Guide

> **Tagline**: Every concern deserves a resolution.  
> **Target Environment**: Multi-Institution Campus Deployment (Linux / Docker / Cloud)

---

## 1. Production Architecture Overview

```
                      Internet / Campus WAN
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Reverse Proxy / SSL│
                    │  (Nginx / Traefik)  │
                    └──────────┬──────────┘
                               │
               ┌───────────────┴───────────────┐
               │ Port 80                       │ Port 8000
               ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │ React Web Container │         │ Gunicorn WSGI Server│
    │  (Vite + Tailwind)  │         │   (Django Core API) │
    └─────────────────────┘         └──────────┬──────────┘
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │ PostgreSQL Database │
                                    │ (Row-Partitioned DB)│
                                    └─────────────────────┘
```

---

## 2. Quickstart with Docker Compose

Ensure Docker and Docker Compose are installed on your host server.

### 2.1 Clone and Configure Environment
```bash
git clone https://github.com/your-org/Grievio.git
cd Grievio
cp .env.example .env
```

Review and adjust variables in `.env`:
```env
DEBUG=False
SECRET_KEY=generate-a-strong-random-50-character-secret
DB_NAME=grievio_prod
DB_USER=grievio_admin
DB_PASSWORD=your-secure-database-password
DB_HOST=db
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://campus.grievio.com,https://api.grievio.com
```

### 2.2 Launch Production Stack
```bash
docker-compose up -d --build
```

Docker Compose will:
1. Spin up the PostgreSQL 16 container with persistent volumes.
2. Build and launch the Django API container with Gunicorn (`3 workers`).
3. Run migrations and seed baseline demo institutions (`APEX-TECH`, `BEACON-ENG`).
4. Build the React web frontend and serve it via Nginx on port `80`.

---

## 3. Background Cron & SLA Escalation Monitoring

Grievio includes an automated SLA checker that inspects grievances across institutions and sends alert notifications to administrators for any overdue complaints.

To run this periodically, add a cron job on your host server:

```bash
# Edit crontab
crontab -e

# Run SLA monitor every hour
0 * * * * docker exec grievio_backend python manage.py check_sla_escalations >> /var/log/grievio_sla.log 2>&1
```

---

## 4. Mobile App Deployment (Android & iOS)

The mobile client is built on **Expo SDK 58** and **Expo Router**.

### 4.1 Production Environment Setup
In `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://api.grievio.com/api/v1
EXPO_PUBLIC_APP_NAME=Grievio
```

### 4.2 Building Android APK / AAB
```bash
cd mobile
npm install
npx eas build --platform android --profile production
```

### 4.3 Building iOS IPA
```bash
cd mobile
npm install
npx eas build --platform ios --profile production
```

---

## 5. Security & Multi-Tenant Verification Checklist

Before opening Grievio to live college students and faculty:

- [ ] `DEBUG=False` in production environment.
- [ ] Unique `SECRET_KEY` set.
- [ ] SSL / HTTPS configured with automatic Let's Encrypt certificates.
- [ ] PostgreSQL default passwords changed.
- [ ] Super Administrator credentials rotated.
- [ ] Database backups configured (daily `pg_dump`).
- [ ] File storage (AWS S3 or secure local persistent volume) configured for `/media/`.
