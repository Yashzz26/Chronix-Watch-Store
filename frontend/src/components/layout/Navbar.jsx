import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { useDebounce } from '../../hooks/useDebounce';
import { getProducts } from '../../services/productService';
import { HiOutlineShoppingCart, HiOutlineUser, HiOutlineSearch, HiOutlineMenu, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, userProfile } = useAuthStore();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  // Live search
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    getProducts({ limitCount: 20 }).then((products) => {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
    });
  }, [debouncedSearch]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUserMenuOpen(false);
    toast.success('Signed out successfully');
    navigate('/');
  };

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-obsidian-800/80 backdrop-blur-xl border-b border-white/5"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <span className="font-display text-2xl font-bold text-white tracking-tight">
            Chronix<span className="text-amber">.</span>
          </span>
        </Link>

        {/* Search — desktop */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
          <div className="relative w-full">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-platinum text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search timepieces..."
              className="w-full bg-obsidian-700 text-white placeholder-platinum text-sm pl-10 pr-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 transition-all"
            />
          </div>
          <AnimatePresence>
            {searchOpen && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute top-full mt-2 left-0 w-full bg-obsidian-700 border border-white/10 rounded-xl overflow-hidden shadow-card z-50"
              >
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-obsidian-600 transition-colors"
                  >
                    <img src={p.imageGallery?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-obsidian-900" />
                    <div>
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <p className="text-amber text-xs font-semibold">₹{(p.dealPrice || p.price).toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-xl hover:bg-obsidian-700 transition-colors text-platinum hover:text-white">
            <HiOutlineShoppingCart className="text-xl" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-obsidian-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-amber/20 border border-amber/30 flex items-center justify-center">
                  <span className="text-amber text-xs font-bold">{initials}</span>
                </div>
                <span className="hidden sm:block text-sm text-platinum max-w-[80px] truncate">
                  {userProfile?.name?.split(' ')[0] || 'Account'}
                </span>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-obsidian-700 border border-white/10 rounded-xl overflow-hidden shadow-card"
                  >
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 text-sm text-platinum hover:text-white hover:bg-obsidian-600 transition-colors">
                      My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 text-sm text-platinum hover:text-white hover:bg-obsidian-600 transition-colors">
                      My Orders
                    </Link>
                    <hr className="border-white/5 mx-4" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-obsidian-600 transition-colors">
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 bg-amber hover:bg-amber-dark text-black text-sm font-semibold rounded-xl transition-colors">
              <HiOutlineUser className="text-base" />
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-obsidian-700 text-platinum">
            {mobileOpen ? <HiX className="text-xl" /> : <HiOutlineMenu className="text-xl" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-obsidian-800"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile search */}
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-platinum" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search timepieces..."
                  className="w-full bg-obsidian-700 text-white placeholder-platinum text-sm pl-10 pr-4 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-amber/50"
                />
              </div>
              <Link to="/" className="block px-3 py-2 text-platinum hover:text-white text-sm font-medium">Home</Link>
              <Link to="/cart" className="block px-3 py-2 text-platinum hover:text-white text-sm font-medium">Cart ({totalItems})</Link>
              {user ? (
                <>
                  <Link to="/profile" className="block px-3 py-2 text-platinum hover:text-white text-sm font-medium">Profile</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-400 text-sm font-medium">Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="block px-3 py-2 text-amber font-semibold text-sm">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
