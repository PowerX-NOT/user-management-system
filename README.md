## MERN User Management System (JWT + RBAC)

Full-stack MERN app (React + Express + MongoDB) with:
- JWT authentication (access token + refresh token in httpOnly cookie)
- Role-based authorization (Admin / Manager / User)
- User lifecycle management + audit fields

### Repo layout
- `backend/`: Express API
- `frontend/`: React app (Vite)

---

## Local development

### 0) Start MongoDB

If you don’t have MongoDB running locally, you can start it with Docker:

```bash
cd /home/pugal/user-management-system
docker compose up -d
```

### Dev-only fallback (no MongoDB installed)

If `MONGODB_URI` points to a local MongoDB (like `mongodb://localhost:27017/...`) and MongoDB is not running, the backend will **automatically fall back to an in-memory MongoDB** in development so you can run the app quickly.

- This fallback is **disabled in production** (production requires a real `MONGODB_URI`, e.g., MongoDB Atlas).
- Any data stored in the in-memory DB is **lost on backend restart**.

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:4000` (default).

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend expects the API base URL in `VITE_API_BASE_URL` (see `frontend/.env.example`).

---

## Seeding an initial Admin

The backend can create a first admin user on startup if these env vars are set:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_ADMIN_NAME`

---

## Render deployment (overview)

- **Backend**: Render Web Service
- **Frontend**: Render Static Site

### Backend (Web Service)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment variables**: set all values from `backend/.env.example`
  - Set `CORS_ORIGIN` to your frontend static site URL

### Frontend (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment variables**:
  - `VITE_API_BASE_URL`: your backend URL (e.g., `https://your-backend.onrender.com`)

### Cookie/CORS notes (important)
- Frontend requests must use `credentials: 'include'` (already implemented).
- Backend must set `cors({ credentials: true, origin: <your-frontend-url> })` (already implemented).
- In production, refresh cookie uses `SameSite=None; Secure` to allow cross-site cookie (already implemented).

See `backend/.env.example` and `frontend/.env.example` for required environment variables.
