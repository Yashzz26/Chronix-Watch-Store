# Chronix — Premium Watch E-Commerce

A full-stack luxury watch e-commerce platform built with React, Firebase, and Razorpay.

## Live Links
- 🛍️ **Store:** https://chronix.vercel.app
- ⚙️ **Admin:** https://chronix-admin.vercel.app
- 🔌 **API:** https://chronix-backend.onrender.com

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Bootstrap 5.3 |
| Animations | Framer Motion |
| State | Zustand |
| Data Fetching | TanStack Query v5 |
| Auth + DB + Storage | Firebase (Auth, Firestore, Storage) |
| Payments | Razorpay |
| Backend | Node.js + Express |
| Deployment | Vercel (frontend/admin) + Render (backend) |

---

## Project Structure

```
chronix/
├── frontend/     ← Customer-facing store (port 5173)
├── backend/      ← REST API + Razorpay integration (port 5000)
└── admin/        ← Admin dashboard (port 5174)
```

---

## Getting Started (Local Dev)

```bash
# 1. Clone and install all dependencies
git clone <repo-url>
cd chronix
npm run install:all

# 2. Configure environment variables
#    frontend/.env  — Firebase config + Razorpay key ID + backend URL
#    backend/.env   — Razorpay keys + Firebase config
#    backend/serviceAccountKey.json — Firebase Admin service account

# 3. Run all three apps
cd frontend && npm run dev    # http://localhost:5173
cd backend  && npm run dev    # http://localhost:5000
cd admin    && npm run dev    # http://localhost:5174
```

**Or from root:**
```bash
npm run dev:frontend
npm run dev:backend
npm run dev:admin
```

---

## Environment Variables

### `frontend/.env`
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_RAZORPAY_KEY_ID=
VITE_BACKEND_URL=http://localhost:5000
```

### `backend/.env`
```env
PORT=5000
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
FRONTEND_URL=http://localhost:5173
```

---

## Setting Up Admin Access

After running the app, create your admin account:

```bash
cd backend
node createAdmin.js
```

Then log in at `http://localhost:5174` with the credentials in `createAdmin.js`.

---

## Deploy

### Frontend & Admin → Vercel
1. Push to GitHub
2. Vercel → New Project → set Root Directory to `frontend` (or `admin`)
3. Add all env vars from `.env`
4. Deploy — `vercel.json` handles SPA routing

### Backend → Render
1. New Web Service → Root directory: `backend`
2. Build: `npm install` | Start: `node src/index.js`
3. Add env vars including `FIREBASE_SERVICE_ACCOUNT_BASE64`

---

## Completed Phases

| Phase | Description |
|---|---|
| ✅ 1 | Monorepo scaffold, design tokens, folder structure |
| ✅ 2 | Backend: Firebase Admin SDK, Razorpay endpoints, auth middleware |
| ✅ 3 | Frontend core: Firebase client, Zustand stores, Navbar, Login, Register |
| ✅ 4 | All frontend pages: Home, ProductDetail, Cart, Checkout, Confirmation, Profile |
| ✅ 5 | Admin panel: Dashboard, Products CRUD, Orders, Customers, Reviews |
| ✅ 6 | Firestore rules, cleanup, UI polish, Vercel + Render deployment |