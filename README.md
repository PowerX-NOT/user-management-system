# UserFlow — MERN User Management System

A production-ready, full-stack user management system built with **React + Express + MongoDB** featuring JWT authentication (access token + refresh token rotation), Role-Based Access Control (RBAC), and full audit trails.

---

## ✨ Features

- 🔐 **JWT Authentication** — Access token (15m) + refresh token rotation (30d) stored in an httpOnly cookie
- 👥 **Three roles** — Admin / Manager / User with fine-grained RBAC on every API route
- 🛡️ **Protected routes** — Both client-side guards and server-side enforcement (401/403)
- 📋 **User lifecycle management** — Create, read, update, soft-delete with role constraints
- 🔍 **Paginated + searchable user list** — Filter by role and status
- ✏️ **Audit trail** — `createdAt`, `updatedAt`, `createdBy`, `updatedBy` on every user record
- 🌑 **Premium dark UI** — Glassmorphism, gradient accents, micro-animations
- 🚀 **Render-ready** — Backend (Web Service) + Frontend (Static Site) deployment guide

---

## 🎥 Demo

- [`demo/demo.mp4`](demo/demo.mp4)

---

## 📁 Repository Layout

```
user-management-system/
├── backend/           # Express REST API (Node.js)
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # authRequired, requirePermission, validate, error
│   │   ├── models/        # Mongoose schemas (User, RefreshToken)
│   │   ├── rbac/          # permissions.js — role → permission map
│   │   ├── routes/        # auth.js, users.js, me.js
│   │   ├── services/      # authService, userService
│   │   ├── setup/         # db.js (Mongo + in-memory fallback), seed.js
│   │   ├── utils/         # jwt.js, password.js, crypto.js
│   │   ├── validation/    # Zod schemas (authSchemas, userSchemas, meSchemas)
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── routes/    # App.jsx, ProtectedRoute.jsx, RoleRoute.jsx
│   │   ├── state/     # AuthContext.jsx (global auth state)
│   │   ├── ui/        # Layout.jsx (nav)
│   │   ├── utils/     # api.js (fetch wrapper)
│   │   ├── views/     # LoginPage, DashboardPage, UsersPage, UserDetailPage, MePage
│   │   ├── styles.css # Design system (dark mode)
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── docker-compose.yml # Spins up a local MongoDB container
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 LTS or later |
| npm | 9+ |
| MongoDB | 6+ (or use Docker / the built-in in-memory fallback) |

---

### Step 0 — Start MongoDB

**Option A — Docker (recommended, zero install)**

```bash
# From the repo root
docker compose up -d
```

This starts MongoDB on `localhost:27017`. Stop it later with `docker compose down`.

**Option B — In-memory fallback (dev only, no Docker needed)**

If `MONGODB_URI` points to a local Mongo that isn't running, the backend **automatically falls back** to an in-memory MongoDB (via `mongodb-memory-server`). All data is **lost on restart**. This works great for quick testing — no DB install required.

**Option C — MongoDB Atlas (cloud, free tier)**

Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com) and copy the connection URI.

---

### Step 1 — Backend

```bash
cd backend

# Install dependencies
npm install

# Copy the example env file
cp .env.example .env
```

Edit `backend/.env` and make sure these values are correct:

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `4000` | API listening port |
| `MONGODB_URI` | `mongodb://localhost:27017/ums` | Your Mongo connection string |
| `JWT_ACCESS_SECRET` | ⚠️ change me | Min 32 chars, keep secret |
| `JWT_REFRESH_SECRET` | ⚠️ change me | Min 32 chars, keep secret |
| `ACCESS_TOKEN_TTL` | `15m` | JWT access expiry |
| `REFRESH_TOKEN_TTL` | `30d` | JWT refresh expiry |
| `CORS_ORIGIN` | `http://localhost:5173` | Frontend URL |
| `SEED_ADMIN_EMAIL` | `admin@example.com` | Auto-created on first start |
| `SEED_ADMIN_PASSWORD` | `Admin123!ChangeMe` | **Change this before going live!** |
| `SEED_ADMIN_NAME` | `Admin` | Display name |

Start the backend in development mode (auto-restarts on file changes):

```bash
npm run dev
```

API is available at **http://localhost:4000**. Health check: `http://localhost:4000/api/health`

---

### Step 2 — Frontend

Open a new terminal tab:

```bash
cd frontend

# Install dependencies
npm install

# Copy the example env file
cp .env.example .env
```

Edit `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:4000
```

> Leave this blank (or remove) to proxy through the same origin (useful if you put both behind a reverse proxy).

Start the frontend dev server:

```bash
npm run dev
```

Frontend is available at **http://localhost:5173**.

Open the browser and log in with the seeded admin:
- **Email**: `admin@example.com`
- **Password**: `Admin123!ChangeMe`

---

### Step 3 — (Optional) Build the Frontend Locally

```bash
cd frontend
npm run build
# Serve the dist/ folder with any static file server
npx serve dist
```

---

## 🔑 Role Permissions

| Action | Admin | Manager | User |
|--------|-------|---------|------|
| View user list | ✅ | ✅ | ❌ |
| View user detail | ✅ | ✅ (non-admin only) | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Edit user (name/email/status) | ✅ | ✅ (non-admin only) | ❌ |
| Change user role | ✅ | ❌ | ❌ |
| Deactivate (soft-delete) user | ✅ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Update own name/password | ✅ | ✅ | ✅ |
| Change own role | ❌ | ❌ | ❌ |

---

## 🌐 Deploying to Render

### Overview

| Service | Type |
|---------|------|
| Backend | Render **Web Service** |
| Frontend | Render **Static Site** |
| Database | **MongoDB Atlas** (free tier) |

---

### Step 1 — Provision a MongoDB Atlas Database

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Free tier (M0)**.
2. Create a cluster, a DB user (username + password), and allow all IPs (`0.0.0.0/0`) in Network Access.
3. Click **Connect → Drivers** and copy the connection string, e.g.:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/ums?retryWrites=true&w=majority
   ```

---

### Step 2 — Deploy the Backend (Web Service)

1. In Render dashboard → **New → Web Service**.
2. Connect your GitHub repo.
3. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Node version** | 18 (or later) |

4. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `MONGODB_URI` | *(your Atlas URI)* |
| `JWT_ACCESS_SECRET` | *(random 40+ char string)* |
| `JWT_REFRESH_SECRET` | *(different random 40+ char string)* |
| `ACCESS_TOKEN_TTL` | `15m` |
| `REFRESH_TOKEN_TTL` | `30d` |
| `CORS_ORIGIN` | *(your Render frontend URL, e.g. `https://userflow.onrender.com`)* |
| `REFRESH_COOKIE_NAME` | `ums_refresh` |
| `SEED_ADMIN_EMAIL` | *(your admin email)* |
| `SEED_ADMIN_PASSWORD` | *(a strong password)* |
| `SEED_ADMIN_NAME` | `Admin` |

5. Click **Create Web Service**.

> **Generate secure secrets:** `openssl rand -base64 40`

---

### Step 3 — Deploy the Frontend (Static Site)

1. In Render dashboard → **New → Static Site**.
2. Connect the same GitHub repo.
3. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | *(your Render backend URL, e.g. `https://userflow-api.onrender.com`)* |

5. Click **Create Static Site**.
6. After deploy, go back to the backend service and update `CORS_ORIGIN` to match the deployed frontend URL. Then **restart** the backend service.

---

### Step 4 — Configure SPA Routing (Static Site)

Render needs a rewrite rule so React Router works on page refresh (if you use `BrowserRouter`).

This project uses **hash routing** (URLs like `/#/users`) which avoids 404s on refresh even without rewrites, but keeping the rewrite rule is still fine.

1. In your Static Site settings → **Redirects/Rewrites**.
2. Add a rule:

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | Rewrite |

---

### Cookie / CORS Notes (Important)

The refresh token is stored in an `httpOnly` cookie. In production (cross-site setup):

- `SameSite=None; Secure` is set automatically when `NODE_ENV=production`.
- The frontend **must** call `fetch` with `credentials: 'include'` (already done).
- `CORS_ORIGIN` **must** match the frontend origin exactly (no trailing slash).
- Both frontend and backend **must** be served over **HTTPS** in production — Render handles this automatically.

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | ❌ | Login — returns `accessToken`, sets refresh cookie |
| `POST` | `/api/auth/refresh` | ❌ | Refresh access token using httpOnly cookie |
| `POST` | `/api/auth/logout` | ❌ | Revoke refresh token, clear cookie |

### Me (own profile)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/me` | Bearer | Get own profile |
| `PATCH` | `/api/me` | Bearer | Update own name / password |

### Users (admin / manager)

| Method | Endpoint | Auth | Role Required |
|--------|----------|------|---------------|
| `GET` | `/api/users` | Bearer | admin, manager |
| `POST` | `/api/users` | Bearer | admin |
| `GET` | `/api/users/:id` | Bearer | admin, manager |
| `PATCH` | `/api/users/:id` | Bearer | admin, manager |
| `DELETE` | `/api/users/:id` | Bearer | admin |

---

## 🧪 Default Dev Credentials

After starting with the default `.env`:

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `Admin123!ChangeMe` |
| Role | `admin` |

> ⚠️ Change `SEED_ADMIN_PASSWORD` before any real deployment!

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Vite |
| Backend | Express 4, Node.js 18+ |
| Database | MongoDB + Mongoose |
| Auth | jsonwebtoken, bcrypt |
| Validation | Zod |
| Security | helmet, cors, express-rate-limit |

---

## 📝 License

MIT
