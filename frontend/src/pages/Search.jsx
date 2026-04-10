import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonCard from '../components/ui/SkeletonCard';
import StarDisplay from '../components/ui/StarDisplay';
import useWishlistStore from '../store/wishlistStore';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi2';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(keyword);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setInputValue(keyword);
    fetchResults(keyword);
  }, [keyword]);

  const fetchResults = async (value) => {
    const normalized = value?.trim() || '';
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '48' });
      if (normalized) params.set('keyword', normalized);
      const response = await fetch(`${backendUrl}/api/products?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch products');
      setResults(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const safeKeyword = keyword.trim();
  const heading = safeKeyword ? `Results for “${safeKeyword}”` : 'Browse the catalog';
  const emptyMessage = safeKeyword
    ? `No watches matched “${safeKeyword}”. Try a different keyword or check the spelling.`
    : 'Start with a keyword like “steel”, “analog”, or “rose gold”.';

  return (
    <div className="search-page">
      <style>{`
        .search-page {
          background: var(--bg);
          min-height: 100vh;
          padding-top: 120px;
          color: var(--t1);
        }
        .search-page .container {
          max-width: 1100px;
        }
        .search-form {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .search-form input {
          flex: 1;
          border: 1px solid var(--border);
          padding: 14px 18px;
          border-radius: 999px;
          font-size: 1rem;
          background: var(--s1);
          color: var(--t1);
        }
        .search-form input:focus { outline: 1px solid var(--gold); }
        .search-form button {
          border: none;
          border-radius: 999px;
          padding: 0 28px;
          background: var(--t1);
          color: #fff;
          font-weight: 600;
          letter-spacing: 0.1em;
        }
        .search-results-grid {
          margin-top: 32px;
        }
        .search-card {
          background: #fff;
          border: 1px solid var(--border);
          padding: 24px;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .search-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 38px rgba(0,0,0,0.08);
        }
        .search-card img {
          width: 100%;
          height: 200px;
          object-fit: contain;
          margin-bottom: 18px;
        }
        .search-card h3 {
          font-size: 1rem;
          margin-bottom: 8px;
        }
        .search-empty {
          padding: 48px;
          text-align: center;
          border: 1px dashed var(--border);
          background: var(--bg-1);
          border-radius: 16px;
        }
        .search-error {
          margin-top: 16px;
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid #e74c3c;
          background: rgba(231, 76, 60, 0.1);
          color: #b03a2e;
        }
      `}</style>

      <div className="container">
        <h1 className="display-5 fw-bold">Find your next piece</h1>
        <p className="text-t3">Search across the entire Chronix catalog.</p>

        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="search"
            placeholder="Search watches..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="Search catalog"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        <h2 className="h4 mt-5">{heading}</h2>
        {error && <div className="search-error">{error}</div>}

        {loading ? (
          <div className="row g-4 search-results-grid">
            {Array.from({ length: 8 }, (_, i) => (
              <div className="col-6 col-md-4 col-lg-3" key={i}><SkeletonCard /></div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty mt-4">{emptyMessage}</div>
        ) : (
          <div className="row g-4 search-results-grid">
            {results.map((product) => (
              <div className="col-6 col-md-4 col-lg-3" key={product.id}>
                <div className="position-relative h-100" style={{ transform: 'scale(1)', transition: 'transform 0.2s ease' }}>
                  <Link 
                    to={`/product/${product.id}`} 
                    className="search-card h-100 d-flex flex-column"
                    style={{ borderRadius: '20px', overflow: 'hidden' }}
                  >
                    <div className="p-3 bg-white" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <img src={product.imageGallery?.[0]} alt={product.name} style={{ maxHeight: '160px', objectFit: 'contain' }} />
                    </div>
                    <div className="p-3 bg-white border-top border-border">
                       <span className="x-small text-gold text-uppercase tracking-widest fw-bold mb-1 d-block">{product.category || 'Chronix'}</span>
                       <h3 className="fw-bold h6 mb-2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                       <div className="mb-2">
                         <StarDisplay rating={product.avgRating} count={product.reviewCount} size="0.6rem" />
                       </div>
                       <div className="d-flex justify-content-between align-items-center">
                          <span className="text-t1 fw-bold">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                          <span className="x-small fw-bold text-t3 opacity-50">VIEW PIECE</span>
                       </div>
                    </div>
                  </Link>

                  <button 
                    className="position-absolute top-0 end-0 m-2 btn p-0 z-2"
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                  >
                    <AnimatePresence mode="wait">
                       {isInWishlist(product.id) ? (
                          <motion.div key="in" initial={{ scale: 0.5 }} animate={{ scale: [0.5, 1.3, 1] }}>
                             <HiHeart size={18} className="text-danger m-0" />
                          </motion.div>
                       ) : (
                          <motion.div key="out" whileHover={{ scale: 1.1 }}>
                             <HiOutlineHeart size={18} className="text-t3 m-0" />
                          </motion.div>
                       )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
