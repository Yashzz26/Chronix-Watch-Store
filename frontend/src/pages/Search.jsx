import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(keyword);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          <div className="py-5 text-center text-t3">Looking up watches…</div>
        ) : results.length === 0 ? (
          <div className="search-empty mt-4">{emptyMessage}</div>
        ) : (
          <div className="row g-4 search-results-grid">
            {results.map((product) => (
              <div className="col-6 col-md-4 col-lg-3" key={product.id}>
                <Link to={`/product/${product.id}`} className="search-card">
                  <img src={product.imageGallery?.[0]} alt={product.name} />
                  <span className="x-small text-t3 text-uppercase tracking-widest">{product.category || 'Chronix'}</span>
                  <h3 className="fw-bold">{product.name}</h3>
                  <span className="text-gold fw-bold">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
