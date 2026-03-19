import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingCart, HiArrowRight } from 'react-icons/hi';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index }) {
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
      className="chronix-card h-100 flex-column overflow-hidden position-relative"
    >
      <Link to={`/product/${product.id}`} className="d-block position-relative overflow-hidden bg-s2" style={{ aspectRatio: '4/5' }}>
        <motion.img
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          src={product.imageGallery[0]}
          alt={product.name}
          className="w-100 h-100 object-fit-contain p-4"
        />
        {product.isOnDeal && (
          <div className="position-absolute top-0 start-0 m-3 bg-gold text-bg text-[0.65rem] font-bold px-2 py-1 rounded uppercase tracking-wider" style={{ zIndex: 10 }}>
            Deal
          </div>
        )}
      </Link>

      <div className="p-4 d-flex flex-column flex-grow-1">
        <div className="mb-auto">
          <p className="section-label mb-1" style={{ fontSize: '0.6rem' }}>{product.category}</p>
          <h3 className="font-display h5 text-t1 font-medium mb-2" style={{ transition: 'color 0.3s' }}>
            {product.name}
          </h3>
          <div className="d-flex align-items-center gap-3">
            <span className="font-mono text-gold font-medium">
              ₹{(product.dealPrice || product.price).toLocaleString('en-IN')}
            </span>
            {product.isOnDeal && (
              <span className="font-mono text-t3 text-sm text-decoration-line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button
            onClick={handleAdd}
            className="btn-chronix-primary flex-grow-1 py-2 px-0 d-flex align-items-center justify-content-center gap-2 text-xs"
          >
            <HiOutlineShoppingCart size={14} /> Add
          </button>
          <Link
            to={`/product/${product.id}`}
            className="p-2 border border-border rounded text-t2 hover:border-gold hover:text-gold transition-colors d-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40 }}
          >
            <HiArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
