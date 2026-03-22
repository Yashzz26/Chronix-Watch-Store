import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import useAuthStore, { initAuthListener } from './store/authStore';

const Home           = lazy(() => import('./pages/Home'));
const ProductDetail  = lazy(() => import('./pages/ProductDetail'));
const Cart           = lazy(() => import('./pages/Cart'));
const Checkout       = lazy(() => import('./pages/Checkout'));
const Confirmation   = lazy(() => import('./pages/Confirmation'));
const Login          = lazy(() => import('./pages/Login'));
const Profile        = lazy(() => import('./pages/Profile'));
const Orders         = lazy(() => import('./pages/Orders'));
const NotFound       = lazy(() => import('./pages/NotFound'));

const Loader = () => (
  <div className="d-flex align-items-center justify-content-center min-vh-50 py-5">
    <div className="spinner-border text-gold" role="status" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const Protected = ({ children }) => {
  const { isLoggedIn, loading, sessionToken } = useAuthStore();
  
  if (loading) return <Loader />;

  // Section 1.5 — Double check: both Zustand flag AND sessionStorage token must match
  const sessionValid = sessionToken && sessionStorage.getItem('chronix-session') === sessionToken;

  if (!isLoggedIn || !sessionValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  const validateSession = useAuthStore(s => s.validateSession);

  useEffect(() => {
    initAuthListener();
    validateSession();

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 100);

    // Section 4.1 — Safety timeout: Never leave the user on a loader for more than 4s
    const timer = setTimeout(() => {
      useAuthStore.setState({ loading: false });
    }, 4000);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [validateSession]);

  const loading = useAuthStore(s => s.loading);

  if (loading) return <Loader />;

  return (
    <div className="min-vh-100 bg-bg text-t1 d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1 container pb-5 mb-5">

        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/"                   element={<Home />} />
            <Route path="/product/:id"        element={<ProductDetail />} />
            <Route path="/login"              element={<Login />} />
            <Route path="/cart"               element={<Protected><Cart /></Protected>} />
            <Route path="/checkout"           element={<Protected><Checkout /></Protected>} />
            <Route path="/confirmation"       element={<Protected><Confirmation /></Protected>} />
            <Route path="/profile"            element={<Protected><Profile /></Protected>} />
            <Route path="/orders"             element={<Protected><Orders /></Protected>} />
            <Route path="*"                   element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F0F0F',
            color: '#F0EDE8',
            border: '1px solid #2A2A2A',
            borderRadius: '8px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#D4AF37', secondary: '#080808' } },
          error:   { iconTheme: { primary: '#C0392B', secondary: '#080808' } },
        }}
      />
    </div>
  );
}
