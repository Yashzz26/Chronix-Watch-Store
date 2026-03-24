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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'sticky', top: 0, zIndex: 1000,
        height: '72px',
        background: 'rgba(8,8,8,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div className="container-fluid px-4 w-100">
        <div className="d-flex align-items-center justify-content-between gap-4">

          {/* LEFT: Logo */}
          <Link to="/" className="text-decoration-none flex-shrink-0">
            <span style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}>
              Chronix<span style={{ color: '#D4AF37' }}>.</span>
            </span>
          </Link>

          {/* CENTER: Search */}
          <div className="flex-grow-1 d-none d-md-block" style={{ maxWidth: '480px' }}>
            <SearchBar />
          </div>

          {/* RIGHT: Actions */}
          <div className="d-flex align-items-center gap-2">

            {/* Cart Icon */}
            <Link to="/cart" className="nav-link p-2 position-relative d-flex align-items-center justify-content-center" style={{ color: '#ffffff', transition: 'color 0.3s ease' }}>
              <HiOutlineShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="font-mono" style={{
                  position: 'absolute', top: '0', right: '0',
                  fontSize: '0.65rem', fontWeight: 700,
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#D4AF37', color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Separator */}
            <div className="d-none d-sm-block mx-2" style={{ width: '1px', height: '20px', background: '#1a1a1a' }}></div>

            {/* User Profile */}
            {isLoggedIn ? (
              <div className="position-relative">
                <button
                  onClick={() => setUserMenu(s => !s)}
                  className="bg-transparent border-0 p-0 overflow-hidden rounded-circle"
                  style={{ 
                    width: '32px', height: '32px', 
                    border: '1px solid #D4AF37',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-gold bg-dark" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {initials}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                        width: '200px', background: '#0f0f0f', 
                        border: '1px solid #2a2a2a', borderRadius: '10px',
                        overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
                        zIndex: 1001
                      }}
                    >
                      <Link to="/profile" onClick={() => setUserMenu(false)} className="nav-link w-100 text-start px-3 py-2 border-bottom border-border" style={{ display: 'block', fontSize: '0.85rem', color: '#9A9690' }}>
                        My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenu(false)} className="nav-link w-100 text-start px-3 py-2 border-bottom border-border" style={{ display: 'block', fontSize: '0.85rem', color: '#9A9690' }}>
                        My Acquisitions
                      </Link>
                      <button onClick={handleLogout} className="w-100 text-start px-3 py-2 bg-transparent border-0" style={{ fontSize: '0.85rem', color: '#C0392B' }}>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-gold py-1 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                <HiOutlineUser size={16} /> <span className="d-none d-sm-inline">Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button className="d-md-none bg-transparent border-0 text-white p-2" onClick={() => setMobileOpen(s => !s)}>
              {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: '#0f0f0f', borderTop: '1px solid #2a2a2a',
              padding: '2rem', zIndex: 1002, borderTopLeftRadius: '20px', borderTopRightRadius: '20px'
            }}
          >
            <div className="d-flex flex-column gap-3">
              <SearchBar />
              <Link to="/" className="text-decoration-none py-2 border-bottom border-border" style={{ color: '#F0EDE8', fontSize: '1.2rem', fontFamily: 'Cormorant Garamond' }}>Home</Link>
              <Link to="/cart" className="text-decoration-none py-2 border-bottom border-border" style={{ color: '#F0EDE8', fontSize: '1.2rem', fontFamily: 'Cormorant Garamond' }}>Collection Cart</Link>
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="text-decoration-none py-2 border-bottom border-border" style={{ color: '#F0EDE8', fontSize: '1.2rem', fontFamily: 'Cormorant Garamond' }}>My Profile</Link>
                  <Link to="/orders" className="text-decoration-none py-2 border-bottom border-border" style={{ color: '#F0EDE8', fontSize: '1.2rem', fontFamily: 'Cormorant Garamond' }}>Orders</Link>
                  <button onClick={handleLogout} className="text-start bg-transparent border-0 py-2" style={{ color: '#C0392B', fontSize: '1.2rem', fontFamily: 'Cormorant Garamond' }}>Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="text-gold py-2" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
