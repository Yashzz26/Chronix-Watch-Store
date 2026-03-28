import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineShoppingCart, 
  HiOutlineUser, 
  HiMenu, 
  HiX, 
  HiOutlineSearch 
} from 'react-icons/hi';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { products } from '../../data/products';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useCartStore((s) => s.items);
  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const { isLoggedIn, user, profile, logout } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

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
    const photo = sessionStorage.getItem('chronix-profile-photo');
    if (photo) setProfilePhoto(photo);
    else setProfilePhoto(null);
  }, [isLoggedIn, profile?.photo]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSearchResults(filtered);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    setProfilePhoto(null);
    setUserMenuOpen(false);
    navigate('/');
  };

  const initials = profile?.name?.trim()
    ? profile.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'User';

  return (
    <>
      <style>{`
        .nav-wrapper {
          position: sticky;
          top: 0;
          z-index: 200;
          background: var(--s1);
          border-bottom: 1px solid var(--border);
          height: 72px;
          font-family: var(--font-body);
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          height: 100%;
        }

        .wordmark {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.8rem;
          color: var(--t1);
          text-decoration: none;
          flex-shrink: 0;
          letter-spacing: -0.02em;
        }

        .wordmark span {
          color: var(--gold);
        }

        .search-container {
          flex-grow: 1;
          max-width: 440px;
          position: relative;
        }

        .search-input {
          width: 100%;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 99px;
          padding: 9px 16px 9px 42px;
          font-size: 0.875rem;
          color: var(--t1);
          transition: var(--transition);
        }

        .search-input::placeholder {
          color: var(--t3);
        }

        .search-input:focus {
          border-color: var(--gold);
          background: var(--s1);
          box-shadow: 0 0 0 4px var(--gold-glow);
          outline: none;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--t3);
          pointer-events: none;
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: 0;
          right: 0;
          background: var(--s1);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          z-index: 210;
        }

        .search-result-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          text-decoration: none;
          transition: var(--transition);
          border-bottom: 1px solid var(--bg-2);
        }

        .search-result-row:last-child {
          border-bottom: none;
        }

        .search-result-row:hover {
          background: var(--bg-2);
        }

        .search-thumb {
          width: 44px;
          height: 44px;
          background: var(--bg-3);
          border-radius: 6px;
          object-fit: contain;
          padding: 4px;
        }

        .search-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--t1);
          display: block;
        }

        .search-price {
          font-size: 0.75rem;
          color: var(--gold);
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .icon-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cart-btn {
          position: relative;
          color: var(--t1);
          padding: 8px;
          border-radius: 99px;
          transition: var(--transition);
        }

        .cart-btn:hover {
          background: var(--bg-2);
          color: var(--gold);
        }

        .cart-badge {
          position: absolute;
          top: 0;
          right: 0;
          min-width: 18px;
          height: 18px;
          border-radius: 99px;
          background: var(--gold);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid var(--s1);
        }

        .user-btn-logged {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 14px 5px 6px;
          background: transparent;
          border: 1.5px solid var(--border);
          border-radius: 99px;
          cursor: pointer;
          transition: var(--transition);
        }

        .user-btn-logged:hover {
          border-color: var(--gold);
          background: var(--bg-2);
        }

        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--bg-3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--t2);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .username-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--t1);
        }

        .user-btn-signin {
          background: var(--t1);
          color: #fff !important;
          font-weight: 600;
          padding: 9px 22px;
          border-radius: 99px;
          font-size: 0.85rem;
          transition: var(--transition);
        }

        .user-btn-signin:hover {
          background: var(--gold);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 200px;
          background: var(--s1);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          z-index: 220;
        }

        .dropdown-item {
          display: block;
          padding: 12px 16px;
          font-size: 0.875rem;
          color: var(--t2);
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: var(--transition);
          border-bottom: 1px solid var(--bg-2);
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          color: var(--gold);
          background: var(--bg-2);
        }

        .logout-btn {
          color: #c0392b !important;
        }

        .logout-btn:hover {
          background: #fdf2f2 !important;
        }

        .hamburger {
          background: transparent;
          border: none;
          color: var(--t1);
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .mobile-drawer {
          position: absolute;
          top: 72px;
          left: 0;
          right: 0;
          background: var(--s1);
          border-top: 1px solid var(--border);
          overflow: hidden;
          z-index: 150;
          box-shadow: var(--shadow-lg);
        }

        .mobile-link {
          display: block;
          padding: 16px 24px;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--t1);
          text-decoration: none;
          border-bottom: 1px solid var(--bg-2);
        }

        .mobile-link:last-child {
          border-bottom: none;
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 20px;
            gap: 16px;
          }
        }
      `}</style>

      <header className="nav-wrapper">
        <div className="nav-container">
          <Link to="/" className="wordmark">
            Chronix<span>.</span>
          </Link>

          <div className="search-container d-none d-md-flex" ref={searchRef}>
            <HiOutlineSearch className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input"
              placeholder="Search timepieces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowSearchDropdown(true)}
            />
            
            <AnimatePresence>
              {showSearchDropdown && (
                <motion.div 
                  className="search-dropdown"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {searchResults.length > 0 ? (
                    searchResults.map(p => (
                      <Link 
                        key={p.id} 
                        to={`/product/${p.slug}`}
                        className="search-result-row"
                        onClick={() => setShowSearchDropdown(false)}
                      >
                        <img src={p.imageGallery[0]} alt={p.name} className="search-thumb" />
                        <div className="search-info">
                          <span className="search-name">{p.name}</span>
                          <span className="search-price">₹{p.price.toLocaleString()}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted" style={{ fontSize: '0.8rem' }}>
                      No timepieces found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="icon-group ms-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/cart" className="cart-btn">
                <HiOutlineShoppingCart size={22} />
                {totalItems > 0 && (
                  <motion.span 
                    className="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            <div className="position-relative" ref={userMenuRef}>
              {isLoggedIn ? (
                <>
                  <button 
                    className="user-btn-logged d-none d-md-flex" 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="avatar-circle">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt={firstName} className="avatar-img" />
                      ) : initials}
                    </div>
                    <span className="username-text">{firstName}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        className="user-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link to="/profile" className="dropdown-item">My Profile</Link>
                        <Link to="/orders" className="dropdown-item">My Acquisitions</Link>
                        <button 
                          onClick={handleLogout} 
                          className="dropdown-item logout-btn"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to="/login" className="user-btn-signin d-none d-md-flex">
                  Sign In
                </Link>
              )}
            </div>

            <button 
              className="hamburger d-md-none" 
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              className="mobile-drawer"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="p-4">
                <div className="mb-4">
                  <input 
                    type="text" 
                    className="search-input w-100"
                    placeholder="Search timepieces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Link to="/" className="mobile-link">Home</Link>
                <Link to="/cart" className="mobile-link">
                  Cart ({totalItems})
                </Link>

                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="mobile-link">Profile</Link>
                    <Link to="/orders" className="mobile-link">Orders</Link>
                    <button 
                      onClick={handleLogout} 
                      className="mobile-link w-100 text-start bg-transparent border-0 logout-btn"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="mobile-link" style={{ color: 'var(--gold)' }}>Sign In</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
