import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import useAdminAuthStore from '../store/adminAuthStore';
import { HiOutlineChartBar, HiOutlineShoppingBag, HiOutlineClipboardList, HiOutlineUsers, HiOutlineStar, HiOutlineLogout } from 'react-icons/hi';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Dashboard', icon: HiOutlineChartBar, to: '/' },
  { label: 'Products', icon: HiOutlineShoppingBag, to: '/products' },
  { label: 'Orders', icon: HiOutlineClipboardList, to: '/orders' },
  { label: 'Customers', icon: HiOutlineUsers, to: '/customers' },
  { label: 'Reviews', icon: HiOutlineStar, to: '/reviews' },
];

const Sidebar = () => {
  const { adminProfile, admin } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Signed out');
    navigate('/login');
  };

  const initials = adminProfile?.name
    ? adminProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <aside className="d-flex flex-column bg-obsidian-800 border-end border-white-5" style={{ width: '260px', minHeight: '100vh', zIndex: 100 }}>
      {/* Logo */}
      <div className="px-4 py-4 border-bottom border-white-5">
        <span className="font-display h4 fw-bold text-white mb-0">
          Chronix<span className="text-amber">.</span>
          <span className="font-sans small fw-normal ms-2 text-platinum opacity-75">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-grow-1 px-3 py-4 overflow-y-auto">
        {NAV.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-3 px-3 py-3 rounded-3 mb-1 transition-all ${
                isActive
                  ? 'bg-amber bg-opacity-10 text-amber border-start border-3 border-amber'
                  : 'text-platinum hover-bg-obsidian-700 hover-text-white'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'rgba(245, 166, 35, 0.1)' : 'transparent',
              color: isActive ? 'var(--color-amber)' : 'var(--color-platinum)',
              borderLeft: isActive ? '3px solid var(--color-amber)' : 'none',
              paddingLeft: isActive ? 'calc(1rem - 3px)' : '1rem'
            })}
          >
            <Icon size={20} />
            <span className="small fw-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-top border-white-5">
        <div className="glass p-3 mb-2 d-flex align-items-center gap-3">
          <div className="bg-amber bg-opacity-20 border border-amber border-opacity-30 rounded-circle d-flex align-items-center justify-content-center text-amber fw-bold flex-shrink-0" style={{ width: '36px', height: '36px', fontSize: '13px' }}>
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-white small fw-medium mb-0 text-truncate">{adminProfile?.name || 'Admin'}</p>
            <p className="text-platinum x-small mb-0 text-truncate" style={{ fontSize: '11px' }}>{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn border-0 w-100 d-flex align-items-center gap-3 px-3 py-2 text-platinum hover-text-red transition-all shadow-none"
          style={{ fontSize: '14px' }}
        >
          <HiOutlineLogout size={20} />
          <span>Sign Out</span>
        </button>
      </div>
      <style>{`
        .hover-bg-obsidian-700:hover { background-color: #1A1A24; }
        .hover-text-white:hover { color: #fff !important; }
        .hover-text-red:hover { color: #ff4d4d !important; background-color: rgba(255, 77, 77, 0.1) !important; border-radius: 8px; }
        .nav-link { color: inherit; text-decoration: none; }
        .x-small { font-size: 11px; }
      `}</style>
    </aside>
  );
};

export default Sidebar;
