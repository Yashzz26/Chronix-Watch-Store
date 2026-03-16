import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import useAuthStore from './store/authStore';

const Home           = lazy(() => import('./pages/Home'));
const ProductDetail  = lazy(() => import('./pages/ProductDetail'));
const Cart           = lazy(() => import('./pages/Cart'));
const Checkout       = lazy(() => import('./pages/Checkout'));
const Confirmation   = lazy(() => import('./pages/Confirmation'));
const Login          = lazy(() => import('./pages/Login'));
const Profile        = lazy(() => import('./pages/Profile'));

const Loader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const Protected = ({ children }) => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg text-t1 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/"                   element={<Home />} />
              <Route path="/product/:id"        element={<ProductDetail />} />
              <Route path="/login"              element={<Login />} />
              <Route path="/cart"               element={<Protected><Cart /></Protected>} />
              <Route path="/checkout"           element={<Protected><Checkout /></Protected>} />
              <Route path="/confirmation"       element={<Protected><Confirmation /></Protected>} />
              <Route path="/profile"            element={<Protected><Profile /></Protected>} />
              <Route path="*"                   element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
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
    </BrowserRouter>
  );
}
