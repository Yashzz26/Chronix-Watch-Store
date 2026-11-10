# Copilot instructions for Chronix

## Repository shape

Chronix is a private monorepo with three independently runnable applications:

- `frontend/` is the customer-facing React 19/Vite store on port 5173.
- `admin/` is the React/Vite admin dashboard on port 5174.
- `backend/` is a CommonJS Express API on port 5000.

Firebase is shared across the applications for Authentication, Firestore, and Storage. Razorpay payment orchestration, server-side order creation, inventory checks, coupon validation, email, and privileged mutations belong in the backend. Vercel deploys the two Vite apps; Render runs the backend.

## Commands

Run these from the repository root unless noted:

```bash
npm run install:all
npm run dev                 # frontend, backend, and admin together
npm run dev:frontend
npm run dev:backend
npm run dev:admin
```

Frontend and admin commands are run in their respective directories:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

The backend commands are run from `backend/`:

```bash
npm run dev                 # nodemon src/index.js
npm start                   # node src/index.js
```

There is no implemented automated test suite or test runner. `backend/npm test` is intentionally the default placeholder that exits with an error, and neither Vite app defines a test script; therefore there is no supported single-test command. For backend/API changes, use the `/health` endpoint and the relevant authenticated flow as a smoke check.

## Configuration and local setup

Use the `.env.example` file in each app as the source of required variable names:

- `frontend/.env` and `admin/.env` contain Firebase web configuration and `VITE_BACKEND_URL`.
- `frontend/.env` also contains the Razorpay public key and optional geocoding/phone-verification flags.
- `backend/.env` contains the port, allowed frontend/admin origins, Razorpay secrets, Firebase Admin credentials, OTP, and SMTP settings.

For local backend Firebase Admin access, `backend/serviceAccountKey.json` is loaded when not running production; production expects `FIREBASE_SERVICE_ACCOUNT_BASE64`. Do not commit credentials or local environment files. `backend/createAdmin.js` is the one-time utility for creating the admin account described in the root README.

## Application architecture

### Customer frontend

- `frontend/src/main.jsx` bootstraps Firebase, the router, and `ProductContext`; `App.jsx` owns lazy-loaded routes, global layout, auth initialization, OTP redirect handling, and toast configuration.
- UI is organized into `pages/`, reusable `components/`, Firebase/API `services/`, and Zustand stores under `store/`.
- Authentication and the customer profile are managed by `store/authStore.js`; it persists a small auth snapshot, while `initAuthListener()` rehydrates the Firebase session and synchronizes the wishlist.
- Products and reviews are commonly read directly from Firestore. Checkout, order lifecycle, wishlist synchronization, search, and review mutations use backend endpoints with the Firebase ID token.
- `ProtectedRoute` guards signed-in pages. A signed-in user without `profile.isPhoneVerified` is redirected to `/verify-otp` unless the explicit local bypass flow is active.
- Product and order data use Firestore collection names and fields defined in the existing services/components (`products`, `orders`, `reviews`, `users`, `coupons`). Preserve those names and timestamp conventions when extending features.

### Admin dashboard

- `admin/src/App.jsx` provides the router, React Query client, lazy-loaded pages, protected layout, and shared toasts.
- `adminAuthStore.js` listens to Firebase Auth and only enables the dashboard when the corresponding Firestore `users/{uid}` document has `role: 'admin'`.
- The dashboard reads reporting/list data directly from Firestore, while create/update/delete operations and order status changes use `admin/src/lib/apiHelper.js`.
- `apiCall()` obtains the current Firebase ID token and sends it as `Authorization: Bearer <token>`; use it for new privileged API calls rather than duplicating Axios/fetch setup.
- React Query mutations should invalidate the relevant query after successful writes. Keep admin-only routes behind both the client `AdminProtectedRoute` and backend `verifyAdmin`.

### Backend API

- `backend/src/index.js` configures Helmet, CORS, JSON parsing, request logging, route mounting, `/health`, and the final 404/error handlers.
- Route modules are mounted under `/api/{resource}`. Authentication middleware in `middleware/verifyToken.js` provides three distinct checks: `verifyToken`, `verifyAdmin`, and `requirePhoneVerified`.
- `verifyToken` validates Firebase ID tokens and attaches the decoded user to `req.user`; `verifyAdmin` checks the Firestore user role; `requirePhoneVerified` checks the Firestore profile flag. Apply them in that order where both authentication and authorization are required.
- Route handlers use the Firebase Admin SDK wrapper in `config/firebase.js` and Razorpay configuration in `config/razorpay.js`. Keep payment verification, authoritative pricing/stock/coupon checks, and order writes server-side.
- The production server is exported for the deployment adapter and only calls `listen()` outside production. Preserve this behavior when changing startup code.

## Repository-specific conventions

- Use JavaScript/JSX and the existing module style: ESM imports in `frontend/` and `admin/`, CommonJS in `backend/`. Do not introduce TypeScript or change module mode without updating the affected app configuration.
- Keep route-level code split with `React.lazy` and wrap new customer/admin routes in the existing `Suspense` boundary. Use the existing protected-route components for access control.
- Reuse existing Zustand stores for cross-page client state and the existing Firebase/REST services for data access. Avoid creating a second auth, API client, or Firebase initialization path.
- Treat Firestore rules as part of the feature contract. Public reads, customer-owned profile/order access, and admin writes are deliberately separated; orders and reviews are created through the backend, not by direct client Firestore writes.
- Backend mutating routes should validate the authenticated user and payload, return explicit HTTP errors, and preserve the established JSON error shape (`{ error: '...' }`). Do not bypass middleware for convenience.
- Keep frontend/backend URLs free of trailing-slash assumptions: `VITE_BACKEND_URL` is concatenated with `/api/...`, and backend CORS allowlists are built from `FRONTEND_URL` plus local defaults.
- Follow the existing ESLint flat configs. Warnings currently exist for some React hook and unused-variable rules, but new code should not add avoidable warnings.
- Preserve the existing visual system and component organization: customer styles are colocated with pages/components, while admin styling uses the existing dark dashboard classes in `index.css`.
