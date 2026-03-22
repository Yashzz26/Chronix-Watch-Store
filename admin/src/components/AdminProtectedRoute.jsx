import { Navigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import useAdminAuthStore from '../store/adminAuthStore';

const AdminProtectedRoute = ({ children }) => {
  const { admin, isAdmin, loading } = useAdminAuthStore();

  if (loading) return (
    <div className="min-vh-100 bg-obsidian-900 d-flex align-items-center justify-content-center">
      <div className="spinner-border text-amber" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (!admin) return <Navigate to="/login" replace />;

  if (!isAdmin) return (
    <div className="min-vh-100 bg-obsidian-900 d-flex align-items-center justify-content-center text-center px-4">
      <div>
        <div className="p-3 d-inline-block bg-danger bg-opacity-10 rounded-circle border border-danger border-opacity-25 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#dc3545" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-display fw-bold text-danger mb-3">Access Denied</h2>
        <p className="text-platinum mb-5">This account does not have admin privileges.</p>
        <button
          onClick={() => signOut(auth)}
          className="btn btn-amber px-5 py-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return children;
};

export default AdminProtectedRoute;
