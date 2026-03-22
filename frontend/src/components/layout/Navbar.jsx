import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineUser, HiMenu, HiX } from 'react-icons/hi';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import SearchBar from './SearchBar';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const items = useCartStore(s => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const { isLoggedIn, user, profile, logout } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu]     = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Close mobile menu on navigation
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Load photo from sessionStorage (Section 1.3)
  useEffect(() => {
    const photo = sessionStorage.getItem('chronix-profile-photo');
    if (photo) setProfilePhoto(photo);
    else setProfilePhoto(null);
  }, [userMenu, isLoggedIn, profile?.photo]);

  const handleLogout = () => {
    logout();
    setProfilePhoto(null);
    setUserMenu(false);
    toast.success('Signed out');
    navigate('/');
  };

  const initials = profile?.name?.trim()
    ? profile.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div className="d-flex align-items-center" style={{ height: 64, gap: 24 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '1.6rem',
              fontWeight: 600,
              color: '#F0EDE8',
              letterSpacing: '0.02em',
            }}>
              Chronix<span style={{ color: '#D4AF37' }}>.</span>
            </span>
          </Link>

          {/* Search — desktop (Isolated Component Section 3.2) */}
          <SearchBar />

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

            {/* Cart */}
            <Link to="/cart" className="nav-link" style={{ position: 'relative', padding: 8, borderRadius: 8, display: 'flex' }}>
              <HiOutlineShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="font-mono bg-gold text-bg" style={{
                  position: 'absolute', top: 4, right: 4,
                  fontSize: '0.6rem', fontWeight: 700,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {isLoggedIn ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenu(s => !s)}
                  className="btn-chronix-ghost d-flex align-items-center gap-2"
                  style={{ padding: '6px 12px' }}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)',
                    }}>
                      {initials}
                    </div>
                  )}
                  <span className="d-none d-sm-block text-t2" style={{
                    fontSize: '0.85rem', maxWidth: 80,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {profile?.name?.split(' ')?.[0] || user?.displayName?.split(' ')?.[0] || user?.email?.split('@')?.[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="bg-s1 border-border"
                      style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        width: 180, border: '1px solid', borderRadius: 10,
                        overflow: 'hidden', boxShadow: 'var(--shadow-lux)',
                      }}
                    >
                      <Link to="/profile" onClick={() => setUserMenu(false)} className="nav-link border-bottom border-border" style={{ display: 'block', padding: '11px 16px', fontSize: '0.875rem' }}>
                        My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenu(false)} className="nav-link border-bottom border-border" style={{ display: 'block', padding: '11px 16px', fontSize: '0.875rem' }}>
                        My Acquisitions
                      </Link>
                      <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', color: '#C0392B', fontSize: '0.875rem', cursor: 'pointer' }}>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-chronix-primary px-3 py-2 text-decoration-none d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                <HiOutlineUser size={15} /> Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button className="d-md-none bg-transparent border-0 text-t2 p-2" onClick={() => setMobileOpen(s => !s)}>
              {mobileOpen ? <HiX size={22} /> : <HiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="d-md-none bg-s1 border-top border-border"
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[['/', 'Home'], ['/cart', `Cart (${totalItems})`]].map(([to, label]) => (
                <Link key={to} to={to} className="nav-link border-bottom border-border" style={{ padding: '10px 0', fontSize: '0.95rem' }}>
                  {label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="nav-link border-bottom border-border" style={{ padding: '10px 0', fontSize: '0.95rem' }}>Profile</Link>
                  <button onClick={handleLogout} style={{ padding: '10px 0', background: 'none', border: 'none', color: '#C0392B', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem' }}>Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="text-gold" style={{ padding: '10px 0', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
