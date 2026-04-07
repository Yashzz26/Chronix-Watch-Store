// Last updated: 2026-03-22T22:00:00Z (To force Vite rebuild)
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useShallow } from 'zustand/react/shallow';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import useAuthStore, { initAuthListener } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

const Home           = lazy(() => import('./pages/Home'));
const ProductDetail  = lazy(() => import('./pages/ProductDetail'));
const Cart           = lazy(() => import('./pages/Cart'));
const Checkout       = lazy(() => import('./pages/Checkout'));
const Confirmation   = lazy(() => import('./pages/Confirmation'));
const LoginSignup    = lazy(() => import('./pages/LoginSignup'));
const SearchPage     = lazy(() => import('./pages/Search'));
const Profile        = lazy(() => import('./pages/Profile'));
const Orders         = lazy(() => import('./pages/Orders'));
const Products       = lazy(() => import('./pages/Products'));
const About          = lazy(() => import('./pages/About'));
const Invoice        = lazy(() => import('./pages/Invoice'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const NotFound       = lazy(() => import('./pages/NotFound'));

const Loader = () => (
  <div className="d-flex align-items-center justify-content-center min-vh-50 py-5">
    <div className="spinner-border text-gold" role="status" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isLoggedIn, profile } = useAuthStore(useShallow((state) => ({
    loading: state.loading,
    isLoggedIn: state.isLoggedIn,
    profile: state.profile,
  })));
  const phoneBypass = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('chronix_phone_bypass') === 'true';
  }, [isLoggedIn, profile?.isPhoneVerified]);

  const requiresOtp = isLoggedIn && !profile?.isPhoneVerified && !phoneBypass;

  useEffect(() => {
    if (profile?.isPhoneVerified) {
      try {
        localStorage.removeItem('chronix_phone_bypass');
      } catch (error) {
        console.warn('Could not clear phone bypass flag', error);
      }
    }
  }, [profile?.isPhoneVerified]);

  useEffect(() => {
    const unsubscribe = initAuthListener();

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (requiresOtp && location.pathname !== '/verify-otp') {
      if (!['/login', '/register'].includes(location.pathname)) {
        sessionStorage.setItem('chronix_post_verify_path', `${location.pathname}${location.search}`);
      }
      navigate('/verify-otp', { replace: true, state: { from: location } });
      return;
    }

    if (!requiresOtp && location.pathname === '/verify-otp') {
      const stored = sessionStorage.getItem('chronix_post_verify_path') || '/';
      sessionStorage.removeItem('chronix_post_verify_path');
      const destination = stored === '/verify-otp' ? '/' : stored;
      navigate(destination, { replace: true });
    }
  }, [requiresOtp, isLoggedIn, location, navigate]);

  const isInvoicePage = location.pathname.startsWith('/invoice/');

  if (loading) return <Loader />;

  return (
    <div className="min-vh-100 bg-bg text-t1 d-flex flex-column">
      <ScrollToTop />
      {!isInvoicePage && <Navbar />}
      <main className={`flex-grow-1 ${!isInvoicePage ? 'pb-5 mb-5' : ''}`}>

        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/"                   element={<Home />} />
            <Route path="/product/:id"        element={<ProductDetail />} />
            <Route path="/login"              element={<LoginSignup />} />
            <Route path="/register"           element={<LoginSignup />} />
            <Route path="/search"             element={<SearchPage />} />
            <Route path="/verify-otp"         element={<OTPVerification />} />
            <Route path="/cart"               element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout"           element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/confirmation"       element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
            <Route path="/profile"            element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders"             element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/invoice/:orderId"   element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
            <Route path="/allcollection"      element={<Products />} />
            <Route path="/giftsforher"        element={<Products filterCategory="Gifts for Her" />} />
            <Route path="/giftsforhim"        element={<Products filterCategory="Gifts for Him" />} />
            <Route path="/about"              element={<About />} />
            <Route path="*"                   element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isInvoicePage && <Footer />}
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

