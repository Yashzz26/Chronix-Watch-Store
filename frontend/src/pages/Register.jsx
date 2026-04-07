import { Navigate, useLocation } from 'react-router-dom';

export default function RegisterRedirect() {
  const location = useLocation();
  return <Navigate to={{ pathname: '/register', search: location.search }} replace />;
}

