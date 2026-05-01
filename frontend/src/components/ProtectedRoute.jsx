import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Spinner = () => (
  <div className="d-flex align-items-center justify-content-center min-vh-50 py-5">
    <div className="spinner-border text-gold" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
      <span className="visually-hidden">Loading</span>
    </div>
  </div>
);

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isLoggedIn, loading, profile } = useAuthStore();

  if (loading) {
    return <Spinner />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile?.isPhoneVerified) {
    return <Navigate to="/verify-otp" replace state={{ from: location }} />;
  }

  return children;
}

