import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import useAdminAuthStore from '../store/adminAuthStore';
import {
  HiOutlineChartBar, HiOutlineShoppingBag, HiOutlineClipboardList,
  HiOutlineUsers, HiOutlineStar, HiOutlineLogout, HiOutlineTicket
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Dashboard', icon: HiOutlineChartBar, to: '/' },
  { label: 'Products',  icon: HiOutlineShoppingBag, to: '/products' },
  { label: 'Orders',    icon: HiOutlineClipboardList, to: '/orders' },
  { label: 'Coupons',   icon: HiOutlineTicket, to: '/coupons' },
  { label: 'Customers', icon: HiOutlineUsers, to: '/customers' },
  { label: 'Reviews',   icon: HiOutlineStar, to: '/reviews' },
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
    <aside
      className="d-flex flex-column bg-obsidian-800 border-end border-white-5"
      style={{ width: '260px', minHeight: '100vh', flexShrink: 0, zIndex: 100 }}
    >
      {/* ── Logo ── */}
      <div className="px-4 py-4 border-bottom border-white-5">
        <span className="font-display fw-bold text-white" style={{ fontSize: '1.3rem' }}>
          Chronix<span className="text-amber">.</span>
          <span className="font-sans text-platinum fw-normal ms-2" style={{ fontSize: '0.75rem' }}>
            Admin
          </span>
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-grow-1 px-3 py-3">
        {NAV.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-nav-link${isActive ? ' active' : ''}`
            }
          >
            <Icon size={19} style={{ flexShrink: 0 }} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── User Info ── */}
      <div className="px-3 py-3 border-top border-white-5">
        <div className="glass d-flex align-items-center gap-3 p-3 mb-2" style={{ borderRadius: '0.75rem' }}>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle text-amber fw-bold flex-shrink-0"
            style={{
              width: '38px', height: '38px', fontSize: '13px',
              background: 'rgba(245,166,35,0.12)',
              border: '1px solid rgba(245,166,35,0.25)'
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="text-white small fw-medium mb-0 text-truncate">
              {adminProfile?.name || 'Admin'}
            </p>
            <p className="text-platinum mb-0 text-truncate x-small">
              {admin?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn border-0 w-100 d-flex align-items-center gap-3 px-3 py-2 text-platinum shadow-none transition-all"
          style={{ fontSize: '14px', borderRadius: '0.75rem' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ff4d4d';
            e.currentTarget.style.backgroundColor = 'rgba(255,77,77,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '';
            e.currentTarget.style.backgroundColor = '';
          }}
        >
          <HiOutlineLogout size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
