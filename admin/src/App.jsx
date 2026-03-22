import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { initAdminAuthListener } from './store/adminAuthStore';
import Sidebar from './components/Sidebar';
import AdminProtectedRoute from './components/AdminProtectedRoute';

const AdminLogin  = lazy(() => import('./pages/AdminLogin'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Products    = lazy(() => import('./pages/Products'));
const Orders      = lazy(() => import('./pages/Orders'));
const Customers   = lazy(() => import('./pages/Customers'));
const Reviews     = lazy(() => import('./pages/Reviews'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 2 * 60 * 1000, retry: 1 } },
});

const Spinner = () => (
  <div className="min-vh-100 bg-obsidian-900 d-flex align-items-center justify-content-center">
    <div className="spinner-border text-amber" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="d-flex min-vh-100 bg-obsidian-900 grain-overlay position-relative">
    <Sidebar />
    <main className="flex-grow-1 overflow-auto" style={{ maxHeight: '100vh', zIndex: 1 }}>
      {children}
    </main>
  </div>
);

export default function App() {
  useEffect(() => { initAdminAuthListener(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/*" element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/"          element={<Dashboard />} />
                    <Route path="/products"  element={<Products />} />
                    <Route path="/orders"    element={<Orders />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/reviews"   element={<Reviews />} />
                    <Route path="*"          element={<Navigate to="/" replace />} />
                  </Routes>
                </AdminLayout>
              </AdminProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A24',
            color: '#E8EAF0',
            border: '1px solid rgba(139,143,168,0.15)',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
          },
          success: { iconTheme: { primary: '#F5A623', secondary: '#0A0A0F' } },
        }}
      />
    </QueryClientProvider>
  );
}
