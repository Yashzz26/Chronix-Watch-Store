import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch } from 'react-icons/hi';
import { useDebounce } from '../../hooks/useDebounce';
import { products } from '../../data/products';

export default function SearchBar() {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 250);

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

  return (
    <div ref={searchRef} className="w-100" style={{ position: 'relative' }}>
      <div className="position-relative w-100">
        <HiOutlineSearch style={{
          position: 'absolute', left: 16, top: '50%',
          transform: 'translateY(-50%)',
          color: '#5A5652', fontSize: 18,
          zIndex: 1
        }} />
        <input
          className="form-control"
          style={{ 
            paddingLeft: 48, 
            background: '#111', 
            border: '1px solid #1e1e1e',
            color: '#fff',
            height: '42px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}
          placeholder="Search timepieces…"
          value={query}
          onFocus={(e) => {
            e.target.style.borderColor = '#D4AF37';
            e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.12)';
            if (query.length >= 2) setSearchOpen(true);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#1e1e1e';
            e.target.style.boxShadow = 'none';
          }}
          onChange={e => { 
            const val = e.target.value;
            setQuery(val); 
            if (val.length < 2) setResults([]);
            setSearchOpen(true); 
          }}
        />
      </div>

      <AnimatePresence>
        {searchOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', top: 'calc(100% + 12px)', left: 0, right: 0,
              background: '#0f0f0f', border: '1px solid #2a2a2a',
              borderRadius: 10, overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)', zIndex: 2000,
            }}
          >
            {results.map(p => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                onClick={() => { setQuery(''); setResults([]); setSearchOpen(false); }}
                className="d-flex align-items-center gap-3 p-3 text-decoration-none border-bottom border-border"
                style={{ transition: 'background 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 48, height: 48, background: '#161616', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                  <img src={p.imageGallery[0]} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div className="flex-grow-1">
                  <p className="m-0" style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500, fontFamily: 'Cormorant Garamond' }}>{p.name}</p>
                  <p className="m-0 font-mono text-gold" style={{ fontSize: '0.8rem' }}>
                    ₹{(p.dealPrice || p.price).toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
