import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineSearch, HiOutlineUser, HiMenu, HiX } from 'react-icons/hi';
import { useDebounce } from '../../hooks/useDebounce';
import { products } from '../../data/products';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const totalItems = useCartStore(s => s.totalItems());
  const { isLoggedIn, user, profile, logout } = useAuthStore();

  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu]     = useState(false);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 250);

  // Close mobile menu on navigation
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Live search
  useEffect(() => {
    if (debouncedQuery.length < 2) { setResults([]); return; }
    const filtered = products
      .filter(p => p.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
      .slice(0, 5);
    setResults(filtered);
  }, [debouncedQuery]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    toast.success('Signed out');
    navigate('/');
  };

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.[0]?.toUpperCase() || 'A';

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1A1A1A',
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

          {/* Search — desktop */}
          <div ref={searchRef} className="d-none d-md-flex flex-grow-1" style={{ maxWidth: 440, position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <HiOutlineSearch style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: '#5A5652', fontSize: 16,
              }} />
              <input
                className="form-control chronix-input"
                style={{ paddingLeft: 40, fontSize: '0.875rem' }}
                placeholder="Search timepieces…"
                value={query}
                onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => query.length >= 2 && setSearchOpen(true)}
              />
            </div>

            <AnimatePresence>
              {searchOpen && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: '#0F0F0F', border: '1px solid #2A2A2A',
                    borderRadius: 10, overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 200,
                  }}
                >
                  {results.map(p => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      onClick={() => { setQuery(''); setResults([]); setSearchOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', textDecoration: 'none',
                        borderLeft: '2px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderLeftColor = '#D4AF37'}
                      onMouseLeave={e => e.currentTarget.style.borderLeftColor = 'transparent'}
                    >
                      <img src={p.imageGallery[0]} alt={p.name}
                        style={{ width: 40, height: 40, objectFit: 'contain',
                          background: '#161616', borderRadius: 6 }} />
                      <div>
                        <p style={{ color: '#F0EDE8', fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</p>
                        <p style={{ color: '#D4AF37', fontSize: '0.8rem', fontFamily: '"DM Mono", monospace' }}>
                          ₹{(p.dealPrice || p.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

            {/* Mobile search toggle */}
            <button className="md:hidden" onClick={() => setSearchOpen(s => !s)}
              style={{ background: 'none', border: 'none', color: '#9A9690',
                padding: 8, cursor: 'pointer', borderRadius: 8 }}>
              <HiOutlineSearch size={20} />
            </button>

            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative', padding: 8,
              color: '#9A9690', textDecoration: 'none', borderRadius: 8,
              transition: 'color 0.2s', display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.color = '#F0EDE8'}
              onMouseLeave={e => e.currentTarget.style.color = '#9A9690'}
            >
              <HiOutlineShoppingCart size={20} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: '#D4AF37', color: '#080808',
                  fontSize: '0.6rem', fontFamily: '"DM Mono", monospace', fontWeight: 700,
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
                  style={{ display: 'flex', alignItems: 'center', gap: 8,
                    background: 'none', border: '1px solid #2A2A2A',
                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                    transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#D4AF37'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A2A'}
                >
                  {profile?.photo ? (
                    <img src={profile.photo} alt=""
                      style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: '#D4AF37',
                    }}>
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:block" style={{
                    fontSize: '0.85rem', color: '#9A9690', maxWidth: 80,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {profile?.name?.split(' ')[0] || user?.username}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        width: 180, background: '#0F0F0F',
                        border: '1px solid #2A2A2A', borderRadius: 10,
                        overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                      }}
                    >
                      <Link to="/profile" onClick={() => setUserMenu(false)}
                        style={{ display: 'block', padding: '11px 16px', color: '#9A9690',
                          textDecoration: 'none', fontSize: '0.875rem',
                          borderBottom: '1px solid #1A1A1A', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#F0EDE8'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9A9690'}
                      >
                        My Profile
                      </Link>
                      <button onClick={handleLogout}
                        style={{ width: '100%', textAlign: 'left', padding: '11px 16px',
                          background: 'none', border: 'none', color: '#C0392B',
                          fontSize: '0.875rem', cursor: 'pointer', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#E74C3C'}
                        onMouseLeave={e => e.currentTarget.style.color = '#C0392B'}
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login"
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <HiOutlineUser size={15} /> Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button className="md:hidden" onClick={() => setMobileOpen(s => !s)}
              style={{ background: 'none', border: 'none', color: '#9A9690',
                padding: 8, cursor: 'pointer' }}>
              {mobileOpen ? <HiX size={22} /> : <HiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div className="md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid #1A1A1A' }}
            >
              <div style={{ padding: '12px 0' }}>
                <input className="input" placeholder="Search timepieces…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="md:hidden"
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid #1A1A1A',
              background: '#0A0A0A' }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[['/', 'Home'], ['/cart', `Cart (${totalItems})`]].map(([to, label]) => (
                <Link key={to} to={to}
                  style={{ padding: '10px 0', color: '#9A9690', textDecoration: 'none',
                    fontSize: '0.95rem', borderBottom: '1px solid #161616',
                    transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F0EDE8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9A9690'}
                >
                  {label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link to="/profile" style={{ padding: '10px 0', color: '#9A9690',
                    textDecoration: 'none', fontSize: '0.95rem',
                    borderBottom: '1px solid #161616' }}>
                    Profile
                  </Link>
                  <button onClick={handleLogout}
                    style={{ padding: '10px 0', background: 'none', border: 'none',
                      color: '#C0392B', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem' }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" style={{ padding: '10px 0', color: '#D4AF37',
                  textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
