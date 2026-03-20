import { Navigate } from 'react-router-dom';
import useAdminAuthStore from '../store/adminAuthStore';

const AdminProtectedRoute = ({ children }) => {
  const { admin, isAdmin, loading } = useAdminAuthStore();

  if (loading) return (
    <div className="min-h-screen bg-obsidian-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!admin) return <Navigate to="/login" replace />;

  if (!isAdmin) return (
    <div className="min-h-screen bg-obsidian-900 flex items-center justify-center text-center px-4">
      <div>
        <p className="text-red-400 font-display text-3xl font-bold mb-3">Access Denied</p>
        <p className="text-platinum mb-6">This account does not have admin privileges.</p>
        <button onClick={() => { import('../lib/firebase').then(({auth}) => auth.signOut()); }} className="bg-amber text-black font-semibold px-6 py-2.5 rounded-xl">
          Sign Out
        </button>
      </div>
    </div>
  );

  return children;
};

export default AdminProtectedRoute;
