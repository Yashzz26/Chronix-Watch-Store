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

  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Refs
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setShowSearchDropdown(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Click outside to close menus
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

  // Sync profile photo
  useEffect(() => {
    const photo = sessionStorage.getItem('chronix-profile-photo');
    if (photo) setProfilePhoto(photo);
    else setProfilePhoto(null);
  }, [isLoggedIn, profile?.photo]);

  // Search logic
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Sans:wght@400;500;700&family=DM+Mono&display=swap');

        .nav-wrapper {
          position: sticky;
          top: 0;
          z-index: 200;
          background: rgba(8, 8, 8, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid #1a1a1a;
          height: 72px;
          font-family: 'DM Sans', sans-serif;
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
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          font-size: 1.75rem;
          color: #F0EDE8;
          text-decoration: none;
          flex-shrink: 0;
        }

        .wordmark span {
          color: #D4AF37;
        }

        .search-container {
          flex-grow: 1;
          max-width: 480px;
          position: relative;
        }

        .search-input {
          width: 100%;
          background: #111111;
          border: 1px solid #1e1e1e;
          border-radius: 8px;
          padding: 10px 16px 10px 42px;
          font-size: 0.875rem;
          color: #F0EDE8;
          transition: all 0.2s ease;
        }

        .search-input::placeholder {
          color: #5A5652;
        }

        .search-input:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
          outline: none;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #5A5652;
          pointer-events: none;
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #0f0f0f;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          z-index: 210;
        }

        .search-result-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          text-decoration: none;
          border-left: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .search-result-row:hover {
          background: rgba(255, 255, 255, 0.03);
          border-left-color: #D4AF37;
        }

        .search-thumb {
          width: 40px;
          height: 40px;
          background: #161616;
          border-radius: 6px;
          object-fit: contain;
        }

        .search-info {
          display: flex;
          flex-direction: column;
        }

        .search-name {
          font-size: 0.85rem;
          color: #F0EDE8;
        }

        .search-price {
          font-size: 0.8rem;
          color: #D4AF37;
          font-family: 'DM Mono', monospace;
        }

        .icon-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cart-btn {
          position: relative;
          color: #F0EDE8;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s ease;
          text-decoration: none;
        }

        .cart-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .cart-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #D4AF37;
          color: #000;
          font-size: 0.6rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-btn-logged {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #1e1e1e;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-btn-logged:hover {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.02);
        }

        .avatar-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .username-text {
          max-width: 80px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.85rem;
          color: #9A9690;
        }

        .user-btn-signin {
          background: #D4AF37;
          color: #000 !important;
          font-weight: 700;
          padding: 8px 18px;
          border-radius: 6px;
          font-size: 0.85rem;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .user-btn-signin:hover {
          background: #F0D060;
          transform: translateY(-1px);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 180px;
          background: #0f0f0f;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          z-index: 220;
        }

        .dropdown-item {
          display: block;
          padding: 11px 16px;
          font-size: 0.875rem;
          color: #9A9690;
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: all 0.2s ease;
          border-bottom: 1px solid #1e1e1e;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          color: #F0EDE8;
          background: rgba(255, 255, 255, 0.03);
        }

        .logout-btn {
          color: #C0392B !important;
        }

        .logout-btn:hover {
          background: rgba(192, 57, 43, 0.08);
        }

        .hamburger {
          background: transparent;
          border: none;
          color: #F0EDE8;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-drawer {
          position: absolute;
          top: 72px;
          left: 0;
          right: 0;
          background: #0f0f0f;
          border-top: 1px solid #1a1a1a;
          overflow: hidden;
          z-index: 150;
        }

        .mobile-link {
          display: block;
          padding: 12px 24px;
          font-size: 0.95rem;
          color: #F0EDE8;
          text-decoration: none;
          border-bottom: 1px solid #111;
        }

        .mobile-link-cart {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mobile-cart-count {
          background: #D4AF37;
          color: #000;
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 20px;
          }
        }
      `}</style>

      <header className="nav-wrapper">
        <div className="nav-container">
          {/* LEFT: WORDMARK */}
          <Link to="/" className="wordmark">
            Chronix<span>.</span>
          </Link>

          {/* CENTER: SEARCH (Desktop) */}
          <div className="search-container d-none d-md-flex" ref={searchRef}>
            <HiOutlineSearch className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input"
              placeholder="Search timepieces…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowSearchDropdown(true)}
            />
            
            <AnimatePresence>
              {showSearchDropdown && (
                <motion.div 
                  className="search-dropdown"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
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
                    <div className="p-3 text-center text-muted" style={{ fontSize: '0.8rem' }}>
                      No timepieces found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: ICON GROUP */}
          <div className="icon-group ms-auto">
            {/* CART ICON */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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

            {/* USER BUTTON */}
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
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
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
                  <HiOutlineUser size={16} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* HAMBURGER (Mobile) */}
            <button 
              className="hamburger d-md-none" 
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              className="mobile-drawer"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="p-3">
                <div className="search-container w-100 mb-3" ref={searchRef}>
                  <HiOutlineSearch className="search-icon" size={20} />
                  <input 
                    type="text" 
                    className="search-input"
                    placeholder="Search timepieces…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {/* Reuse search dropdown in mobile if needed, but standard is often simple links */}
                </div>
                
                <Link to="/" className="mobile-link">Home</Link>
                <Link to="/cart" className="mobile-link mobile-link-cart">
                  <span>Cart</span>
                  {totalItems > 0 && <span className="mobile-cart-count">{totalItems}</span>}
                </Link>

                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="mobile-link">Profile</Link>
                    <Link to="/orders" className="mobile-link">Orders</Link>
                    <button 
                      onClick={handleLogout} 
                      className="mobile-link w-100 text-start bg-transparent border-0 border-bottom logout-btn"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="mobile-link" style={{ color: '#D4AF37', fontWeight: 700 }}>Sign In</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
