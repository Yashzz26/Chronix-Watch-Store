import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineArrowRight } from 'react-icons/hi2';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const addItem = useCartStore(s => s.addItem);

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="chronix-card h-100 d-flex flex-column"
      style={{ position: 'relative' }}
    >
      {/* Image Area */}
      <div 
        className="d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden"
        style={{ aspectRatio: '1/1', background: '#161616' }}
      >
        <Link to={`/product/${product.id}`} className="w-100 h-100 d-flex align-items-center justify-content-center">
          <img 
            src={product.imageGallery[0]} 
            alt={product.name} 
            className="card-img img-fluid"
            style={{ maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.5s ease' }}
          />
        </Link>
        
        {product.isOnDeal && (
          <div 
            className="position-absolute top-0 start-0 m-3 px-2 py-1 bg-gold text-dark"
            style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', borderRadius: '2px', zIndex: 2 }}
          >
            Deal
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-4 d-flex flex-grow-1 flex-column">
        <div style={{ fontSize: '0.6rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          {product.category}
        </div>
        
        <Link to={`/product/${product.id}`} className="text-decoration-none">
          <h3 className="font-display text-white mb-2" style={{ fontSize: '1.2rem' }}>{product.name}</h3>
        </Link>

        <div className="mt-auto d-flex align-items-baseline gap-2">
          <span className="font-mono text-gold h5 m-0">₹{(product.dealPrice || product.price).toLocaleString('en-IN')}</span>
          {product.isOnDeal && (
            <span className="font-mono text-t3 text-decoration-line-through" style={{ fontSize: '0.8rem' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <div className="mt-4 d-flex gap-2">
          <button 
            onClick={handleAdd}
            className="btn-ghost flex-grow-1 p-2 d-flex align-items-center justify-content-center gap-2" 
            style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            <HiOutlineShoppingCart size={14} /> Add
          </button>
          <button 
            onClick={() => navigate(`/product/${product.id}`)}
            className="btn-outline-gold p-0 d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
          >
            <HiOutlineArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
