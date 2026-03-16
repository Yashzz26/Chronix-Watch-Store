import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem);
  const displayPrice = product.dealPrice || product.price;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}
      className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{
          background: '#0A0A0A', aspectRatio: '1/1', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', padding: 24,
          borderBottom: '1px solid #1A1A1A',
        }}>
          {product.isOnDeal && (
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: '#D4AF37', color: '#080808',
              fontSize: '0.72rem', fontWeight: 700, fontFamily: '"DM Mono", monospace',
              padding: '4px 10px', borderRadius: 4,
            }}>DEAL</div>
          )}
          <img src={product.imageGallery[0]} alt={product.name} loading="lazy"
            style={{
              maxWidth: '80%', maxHeight: '80%', objectFit: 'contain',
              transition: 'transform 0.5s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: '20px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.7rem', color: '#5A5652',
          letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
          {product.category}
        </span>
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.2rem', fontWeight: 500, color: '#F0EDE8',
            marginBottom: 12, lineHeight: 1.3,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
          onMouseLeave={e => e.currentTarget.style.color = '#F0EDE8'}
          >
            {product.name}
          </h3>
        </Link>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <span style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '1.1rem', color: '#D4AF37', fontWeight: 500,
            }}>
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {product.dealPrice && (
              <span style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.85rem', color: '#3A3A3A', textDecoration: 'line-through',
              }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn-primary"
              onClick={() => { addItem(product); toast.success(`${product.name} added`); }}
              style={{ padding: '10px 0', fontSize: '0.82rem' }}
            >
              Add to Cart
            </button>
            <Link to={`/product/${product.id}`} className="btn-ghost"
              style={{ padding: '10px 0', fontSize: '0.82rem',
                textDecoration: 'none', textAlign: 'center' }}>
              Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
