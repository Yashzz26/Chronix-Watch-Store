import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import useAdminAuthStore from '../store/adminAuthStore';
import {
  HiOutlineChartBar, HiOutlineShoppingBag, HiOutlineClipboardList,
  HiOutlineUsers, HiOutlineStar, HiOutlineLogout, HiOutlineTicket, HiOutlineMenuAlt2
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
  const [collapsed, setCollapsed] = useState(false);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);

  useEffect(() => {
    // Real-time listener for today's stats in the sidebar
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('createdAt', '>=', startOfToday.toISOString()));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let r = 0;
      let count = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'paid' || data.status === 'shipped' || data.status === 'delivered') {
          r += data.totalPrice || 0;
        }
        count++;
      });
      setTodayRevenue(r);
      setTodayOrders(count);
    }, (err) => {
      console.error('Sidebar listener error', err);
    });
    
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
      className="d-flex flex-column bg-obsidian-800 border-end border-white-5 transition-all"
      style={{ 
        width: collapsed ? '80px' : '260px', 
        minHeight: '100vh', 
        flexShrink: 0, 
        zIndex: 100 
      }}
    >
      {/* ── Header ── */}
      <div className="px-3 py-3 border-bottom border-white-5 d-flex align-items-center justify-content-between" style={{ height: '72px' }}>
        {!collapsed && (
          <Link to="/" className="text-decoration-none">
            <span className="font-display fw-bold text-white text-truncate" style={{ fontSize: '1.2rem' }}>
              Chronix<span className="text-amber">.</span>
            </span>
          </Link>
        )}
        <button 
          className="btn btn-sm text-platinum hover-text-white border-0 p-1 mx-auto" 
          onClick={() => setCollapsed(!collapsed)}
        >
          <HiOutlineMenuAlt2 size={24} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-grow-1 px-3 py-3 overflow-hidden">
        {NAV.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-content-center px-0' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && <span className="ms-3">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Quick Stats Footer (Hidden if collapsed) ── */}
      {!collapsed && (
        <div className="px-4 py-3 border-top border-white-5">
           <p className="x-small tracking-widest text-platinum uppercase mb-2 opacity-50">Pulse Today</p>
           <div className="d-flex justify-content-between align-items-end mb-2">
             <span className="small text-white">Revenue</span>
             <span className="font-mono text-amber fw-bold small">₹{todayRevenue.toLocaleString()}</span>
           </div>
           <div className="d-flex justify-content-between align-items-end mb-3">
             <span className="small text-white">Orders</span>
             <span className="font-mono fw-bold small">{todayOrders}</span>
           </div>
        </div>
      )}

      {/* ── User Info ── */}
      <div className="px-3 py-3 border-top border-white-5">
        {!collapsed ? (
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
        ) : (
          <div
            className="d-flex align-items-center justify-content-center rounded-circle text-amber fw-bold mx-auto mb-2 cursor-pointer"
            style={{
              width: '40px', height: '40px', fontSize: '14px',
              background: 'rgba(245,166,35,0.12)',
              border: '1px solid rgba(245,166,35,0.25)'
            }}
            title={adminProfile?.name || 'Admin'}
          >
            {initials}
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`btn border-0 w-100 d-flex align-items-center px-2 py-2 text-platinum shadow-none transition-all ${collapsed ? 'justify-content-center' : 'gap-3 px-3'}`}
          style={{ fontSize: '14px', borderRadius: '0.75rem' }}
          target="_blank"
          title={collapsed ? 'Sign Out' : undefined}
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
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
