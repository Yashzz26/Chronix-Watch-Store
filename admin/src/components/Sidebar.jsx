import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import useAdminAuthStore from '../store/adminAuthStore';
import {
  HiOutlineChartBar, HiOutlineShoppingBag, HiOutlineClipboardList,
  HiOutlineUsers, HiOutlineStar, HiOutlineLogout, HiOutlineTicket, HiOutlineMenuAlt2
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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
  const [collapsed, setCollapsed] = useState(false);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);

  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('createdAt', '>=', startOfToday.toISOString()));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let r = 0, count = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (['paid', 'shipped', 'delivered'].includes(data.status)) r += data.totalPrice || 0;
        count++;
      });
      setTodayRevenue(r);
      setTodayOrders(count);
    }, err => console.error('Sidebar listener error', err));
    return () => unsubscribe();
  }, []);

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
      className="d-flex flex-column transition-all"
      style={{
        width: collapsed ? '72px' : '256px',
        minHeight: '100vh',
        flexShrink: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
      }}
    >
      {/* ── Header ── */}
      <div
        className="d-flex align-items-center justify-content-between"
        style={{ height: '64px', padding: collapsed ? '0 16px' : '0 20px', borderBottom: '1px solid #E5E7EB' }}
      >
        {!collapsed && (
          <Link to="/" className="text-decoration-none">
            <span className="fw-bold" style={{ fontSize: '1.15rem', color: '#111827', fontFamily: 'DM Sans, sans-serif' }}>
              Chronix<span style={{ color: '#D97706' }}>.</span>
            </span>
          </Link>
        )}
        <button
          className="btn border-0 p-1 d-flex align-items-center justify-content-center"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            color: '#6B7280', borderRadius: '8px',
            background: 'transparent',
            marginLeft: collapsed ? 'auto' : 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <HiOutlineMenuAlt2 size={22} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-grow-1 overflow-hidden" style={{ padding: '12px 10px' }}>
        {NAV.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-content-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <motion.span
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.12 }}
                className="d-flex align-items-center gap-3 w-100"
                style={{ pointerEvents: 'none' }}
              >
                <Icon
                  size={19}
                  style={{ flexShrink: 0, color: isActive ? '#111827' : '#9CA3AF' }}
                />
                {!collapsed && <span>{label}</span>}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Pulse Today ── */}
      {!collapsed && (
        <div
          style={{
            margin: '0 10px 12px',
            padding: '14px 16px',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
          }}
        >
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Today's Pulse
          </p>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Revenue</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', fontFamily: 'DM Mono, monospace' }}>
              ₹{todayRevenue.toLocaleString()}
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Orders</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', fontFamily: 'DM Mono, monospace' }}>
              {todayOrders}
            </span>
          </div>
        </div>
      )}

      {/* ── User Info ── */}
      <div style={{ padding: collapsed ? '12px 10px' : '12px 10px', borderTop: '1px solid #E5E7EB' }}>
        {!collapsed ? (
          <div
            className="d-flex align-items-center gap-3 mb-2"
            style={{ padding: '10px 12px', borderRadius: '10px', background: '#F9FAFB', border: '1px solid #E5E7EB' }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
              style={{ width: '36px', height: '36px', fontSize: '12px', background: '#111827', color: '#FFFFFF' }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="mb-0 text-truncate" style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                {adminProfile?.name || 'Admin'}
              </p>
              <p className="mb-0 text-truncate" style={{ fontSize: '11px', color: '#9CA3AF' }}>
                {admin?.email}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="d-flex align-items-center justify-content-center rounded-circle fw-bold mx-auto mb-2 cursor-pointer"
            style={{ width: '38px', height: '38px', fontSize: '12px', background: '#111827', color: '#FFFFFF' }}
            title={adminProfile?.name || 'Admin'}
          >
            {initials}
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`btn border-0 w-100 d-flex align-items-center py-2 shadow-none transition-all ${collapsed ? 'justify-content-center px-2' : 'gap-3 px-3'}`}
          style={{ fontSize: '13px', borderRadius: '10px', color: '#6B7280', fontWeight: 500 }}
          title={collapsed ? 'Sign Out' : undefined}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#991B1B';
            e.currentTarget.style.backgroundColor = '#FEE2E2';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#6B7280';
            e.currentTarget.style.backgroundColor = '';
          }}
        >
          <HiOutlineLogout size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
