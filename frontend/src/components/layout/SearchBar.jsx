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
          onChange={e => { 
            const val = e.target.value;
            setQuery(val); 
            if (val.length < 2) setResults([]);
            setSearchOpen(true); 
          }}
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
                    background: '#161616', borderRadius: 6 }} 
                  loading="lazy" decoding="async"
                />
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
  );
}
