import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShoppingBag,
  HiBars3,
  HiXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineUser
} from 'react-icons/hi2';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { ProductContext } from '../../context/ProductContext';
import './navbar.css';

const navLinks = [
  { label: 'Shop', path: '/allcollection' },
  { label: 'About', path: '/about' },
  { label: 'Gifts', path: '/giftsforher' }
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useCartStore((s) => s.items);
  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const { isLoggedIn, user, profile, logout } = useAuthStore();
  const { products, loading: productsLoading } = useContext(ProductContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setShowSearchDropdown(false);
    setSearchQuery('');
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        const filtered = products
          .filter((p) =>
            (p.name || p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 4);
        setSearchResults(filtered);
        setShowSearchDropdown(true);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, products]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) {
      navigate('/search');
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
    setShowSearchDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const initials = profile?.name?.trim()
    ? profile.name.trim().split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className={`site-nav ${scrolled ? 'site-nav--shadow' : ''}`}>
      <div className="site-nav__inner">
        <Link to="/" className="site-nav__brand">Chronix</Link>

        <nav className="site-nav__links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`site-nav__link ${location.pathname === link.path ? 'site-nav__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form className="site-nav__search" ref={searchRef} onSubmit={handleSearchSubmit}>
          <HiOutlineMagnifyingGlass className="site-nav__search-icon" size={16} />
          <input
            type="text"
            placeholder="Search watches"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length > 1 && setShowSearchDropdown(true)}
            aria-label="Search products"
          />
          <button
            type="submit"
            className="site-nav__search-submit"
            aria-label="Submit search"
          >
            Go
          </button>
          <AnimatePresence>
            {showSearchDropdown && (
              <motion.div
                className="site-nav__results"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {productsLoading ? (
                  <div className="site-nav__result text-t3">Loading products...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      className="site-nav__result"
                      onClick={() => setShowSearchDropdown(false)}
                    >
                      <img src={item.imageGallery?.[0]} alt={item.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                      <div>
                        <div>{item.name || item.title}</div>
                        <small className="text-t3">₹{item.price?.toLocaleString('en-IN')}</small>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="site-nav__result text-t3">No products found.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="site-nav__actions">
          {!isLoggedIn && (
            <Link to="/login" className="site-nav__pill">
              Sign in
            </Link>
          )}

          <Link to="/cart" className="site-nav__icon-btn" aria-label="Cart">
            <HiOutlineShoppingBag size={18} />
            {totalItems > 0 && <span className="site-nav__cart-badge">{totalItems}</span>}
          </Link>

          {isLoggedIn ? (
            <div className="site-nav__user" ref={userMenuRef}>
              <button
                className="site-nav__avatar-btn"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-label="Account"
              >
                <span className="site-nav__avatar-initials">{initials}</span>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="site-nav__user-menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    <div className="site-nav__user-head">
                      <p className="x-small text-uppercase text-t3 mb-1" style={{ letterSpacing: '0.18em' }}>Signed in</p>
                      <p className="m-0 fw-semibold text-t1">{profile?.name || user?.displayName || 'Guest'}</p>
                      <small className="text-t3">{user?.email}</small>
                    </div>
                    <Link to="/profile?tab=details" onClick={() => setUserMenuOpen(false)}>
                      <HiOutlineUser size={16} /> Profile
                    </Link>
                    <Link to="/profile?tab=orders" onClick={() => setUserMenuOpen(false)}>
                      <HiOutlineShoppingBag size={16} /> Orders
                    </Link>
                    <button onClick={handleLogout}>
                      <HiOutlineArrowLeftOnRectangle size={16} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/register" className="site-nav__pill site-nav__pill--filled">
              Join
            </Link>
          )}

          <button className="site-nav__mobile-toggle" onClick={() => setMobileOpen(true)}>
            <HiBars3 size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="site-nav__mobile-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="site-nav__mobile-sheet"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span className="site-nav__brand">Chronix</span>
                <button className="site-nav__icon-btn" onClick={() => setMobileOpen(false)}>
                  <HiXMark size={20} />
                </button>
              </div>

              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}

              <Link to="/cart" onClick={() => setMobileOpen(false)}>
                Cart ({totalItems})
              </Link>

              {isLoggedIn ? (
                <button className="site-nav__pill" onClick={handleLogout}>
                  Sign out
                </button>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    Create account
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

