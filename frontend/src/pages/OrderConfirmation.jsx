import { Navigate, useLocation } from 'react-router-dom';

export default function LegacyOrderConfirmation() {
  const location = useLocation();
  const search = location.search || '';
  const hash = location.hash || '';
  return <Navigate to={`/confirmation${search}${hash}`} replace />;
}

