# BalanceVault 🏦

**Secure Account Management & Auditable Money Movement Platform**

Snovasys Fresher Hiring Challenge 2026

---

## Overview

BalanceVault is a full-stack financial platform demonstrating:

- Secure user registration and JWT authentication
- Role-Based Access Control (RBAC) with ADMIN and ACCOUNT_HOLDER roles
- Account-holder onboarding with admin approval workflow
- Secure money transfers with atomic PostgreSQL transactions
- Double-entry bookkeeping ledger with integrity verification
- Complete audit trail for all sensitive operations
- Idempotent transfers to prevent duplicate payments

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + React Router + Axios |
| Backend | Node.js + Express.js + REST API |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Security | Helmet + Rate Limiting (Redis or Memory) |
| Cache | Redis (optional) |
| Testing | Jest + Supertest |
| Deploy (FE) | Vercel |
| Deploy (BE) | Render |
| DB Provider | Neon PostgreSQL |

---

## Project Structure

```
ledger/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.js              # Admin bootstrap script
│   │   └── migrations/          # SQL migrations
│   ├── src/
│   │   ├── app.js               # Express app entry
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   ├── routes/              # Express routers
│   │   ├── middleware/          # Auth, rate-limit, errors
│   │   ├── validators/          # express-validator rules
│   │   └── utils/               # logger, prisma, redis, helpers
│   ├── tests/                   # Jest + Supertest test suites
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/               # All 16 pages
    │   ├── components/          # Shared UI components
    │   ├── contexts/            # AuthContext
    │   └── services/            # Axios API client
    ├── .env.example
    └── package.json
```

---

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** – copy and edit:
```bash
cp backend/.env.example backend/.env
```

Required variables:
```env
DATABASE_URL="postgresql://user:password@host/balancevault?sslmode=require"
JWT_SECRET=your-64-char-random-secret
JWT_EXPIRES_IN=24h
REDIS_URL=redis://...          # optional
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend** – copy and edit:
```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### 4. Run Database Migrations

```bash
cd backend
npx prisma migrate deploy
```

> For local development with schema changes:
> ```bash
> npx prisma migrate dev --name your_change_name
> ```

### 5. Create the First Admin

```bash
cd backend
node prisma/seed.js
```

Default credentials (change after first login):
- Email: `admin@balancevault.com`
- Password: `Admin@123456`

You can override via env vars:
```bash
ADMIN_EMAIL=myadmin@company.com ADMIN_PASSWORD=SecurePass1 node prisma/seed.js
```

### 6. Start the Backend

```bash
cd backend
npm run dev        # development with nodemon
# or
npm start          # production
```

Backend runs on **http://localhost:4000**

### 7. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

### 8. Run Automated Tests

```bash
cd backend

# Requires a test database – set TEST_DATABASE_URL or use a separate .env.test
DATABASE_URL="postgresql://user:password@host/balancevault_test" npm test
```

---

## Architecture

```
Browser (React SPA)
    │
    │  HTTPS + JWT Bearer token
    ▼
Express.js API (Node.js)
    │
    ├── Helmet (security headers)
    ├── CORS (allowlist)
    ├── Rate Limiter (Redis or memory)
    ├── Request ID middleware
    ├── JWT authenticate middleware
    ├── RBAC authorize middleware
    │
    ├── Routes → Controllers → Services
    │
    └── Prisma ORM
            │
            ▼
    PostgreSQL (Neon)
            │
            ├── users
            ├── onboardings
            ├── accounts
            ├── transactions
            ├── ledger_entries
            ├── audit_logs
            └── idempotency_records
```

---

## Role-Permission Matrix

| Action | ADMIN | ACCOUNT_HOLDER |
|--------|-------|----------------|
| Register / Login | ✓ | ✓ |
| View own profile | ✓ | ✓ |
| Submit onboarding | ✗ | ✓ |
| View own onboarding status | ✗ | ✓ |
| List all onboardings | ✓ | ✗ |
| Approve / reject onboarding | ✓ | ✗ |
| View own accounts | ✗ | ✓ |
| View all accounts | ✓ | ✗ |
| Change account status | ✓ | ✗ |
| Initiate transfer | ✗ | ✓ |
| View own transactions | ✗ | ✓ |
| View all transactions | ✓ | ✗ |
| View audit logs | ✓ | ✗ |
| Verify ledger integrity | ✓ | ✗ |

---

## Security Measures

1. **Password hashing** – bcrypt with 12 salt rounds
2. **JWT tokens** – signed with HS256, expire in 24h, never stored server-side
3. **RBAC** – every protected route checks role server-side; frontend guards are UI-only
4. **Rate limiting** – login/register: 10/15min; transfers: 5/min
5. **Request validation** – express-validator on all inputs
6. **Helmet** – sets 11 security-related HTTP headers
7. **Parameterized queries** – Prisma ORM prevents SQL injection
8. **Audit logging** – sensitive operations logged with actor, timestamp, outcome
9. **No secrets in audit logs** – passwords and tokens are never logged
10. **Idempotency** – transfer keys prevent duplicate payments

---

## Database Design

### Key design decisions

- **Amounts in paise (integer)** – eliminates floating-point rounding errors
- **Row-level locking** – `SELECT … FOR UPDATE` inside transfer transactions prevents overdrafts under concurrency
- **Append-only audit log** – no `UPDATE`/`DELETE` exposed through application APIs
- **Idempotency table** – stores transfer results for 24h; duplicate requests return cached response
- **Foreign keys + constraints** – enforce referential integrity at the DB level

### Ledger integrity rule

Every `COMPLETED` transaction must have:
- Exactly 1 `DEBIT` entry (sender side)
- Exactly 1 `CREDIT` entry (receiver side)
- Both entries with equal `amount_paise`

Verify via: `GET /api/admin/ledger/verify`

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/logout | User | Logout |
| GET | /api/auth/me | User | Current user info |
| POST | /api/onboarding | Account Holder | Submit onboarding |
| GET | /api/onboarding/status | Account Holder | Check onboarding status |
| GET | /api/admin/onboarding | Admin | List all onboardings |
| PATCH | /api/admin/onboarding/:id | Admin | Approve/reject onboarding |
| GET | /api/accounts | User | My accounts |
| GET | /api/accounts/:id | User/Admin | Account details |
| GET | /api/admin/accounts | Admin | All accounts |
| PATCH | /api/admin/accounts/:id/status | Admin | Change account status |
| POST | /api/transfers | Account Holder | Initiate transfer |
| GET | /api/transfers | User | My transactions |
| GET | /api/transfers/:id | User/Admin | Transaction details |
| GET | /api/admin/transactions | Admin | All transactions |
| GET | /api/ledger | User | My ledger entries |
| GET | /api/ledger/:transactionId | User/Admin | Ledger for transaction |
| GET | /api/admin/ledger/verify | Admin | Verify ledger integrity |
| GET | /api/admin/dashboard | Admin | Dashboard stats |
| GET | /api/admin/users | Admin | All users |
| GET | /api/admin/audit-logs | Admin | Audit log entries |
| GET | /health | Public | Health check |
| GET | /ready | Public | Readiness probe |

---

## Database Roles & Bootstrap Strategy

**Production setup (recommended):**

```sql
-- Application role (used by backend)
CREATE ROLE balancevault_app LOGIN PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO balancevault_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO balancevault_app;

-- Migration role (only for running migrations)
CREATE ROLE balancevault_migrate LOGIN PASSWORD 'migrate_password';
GRANT ALL ON SCHEMA public TO balancevault_migrate;
```

The application role has no `DELETE` or `DROP` privileges, limiting blast radius if credentials are compromised.

**Admin bootstrap:** Only through `node prisma/seed.js`. There is no public `/api/auth/admin/register` endpoint. The seed script checks for an existing admin before creating one.

---

## Deployment

### Backend (Render)

1. Connect GitHub repo to Render
2. Set build command: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Set start command: `npm start`
4. Add all `.env` variables in Render dashboard
5. After first deploy: `node prisma/seed.js` (via Render shell)

### Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set root directory to `frontend`
3. Set `VITE_API_URL` env var to your Render backend URL
4. Deploy

### Database (Neon)

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string to `DATABASE_URL` in backend env
3. Run migrations via `npx prisma migrate deploy`

---

## Testing Coverage

| Suite | Tests |
|-------|-------|
| auth.test.js | Register, duplicate email, weak password, login success/fail, /me endpoint |
| rbac.test.js | User blocked from admin routes, admin can access dashboard |
| transfers.test.js | Valid transfer, insufficient balance, negative/zero amount, same-account, idempotency |
| ledger.test.js | Debit/credit pair creation, integrity verification |

---

## Important Security Rules

> These are enforced server-side, not just on the frontend.

- Users **cannot** access another user's account or transactions
- Users **cannot** change their own role to ADMIN
- Users **cannot** directly modify balances
- Users **cannot** bypass onboarding requirements
- Suspended accounts **cannot** send or receive transfers
- Failed transfers **never** deduct from sender balance
- Audit logs are **append-only** through the application
