import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingCart } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import SkeletonCard from './ui/SkeletonCard';

export default function NewArrivals({ products, loading, addItem }) {
  return (
    <section className="new-arrivals-section">
      <style>{`
        .new-arrivals-section {
          background: #FFFFFF;
          padding: var(--spacing-4xl) 0;
        }
        .new-arrivals-header {
          text-align: center;
          margin-bottom: var(--spacing-3xl);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .new-arrivals-title {
          font-family: var(--font-heading);
          font-size: 54px;
          color: var(--color-charcoal);
          letter-spacing: -0.5px;
          margin-bottom: 0;
        }
        .new-arrivals-tagline {
          font-family: var(--font-body);
          font-size: var(--font-size-base);
          color: var(--color-gray-dark);
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-top: 12px;
          font-weight: 500;
        }
        .gold-underline {
          width: 60px;
          height: 3px;
          background: var(--color-gold);
          margin-top: 24px;
        }
        .editorial-product-card {
          background: #FFFFFF;
          border: none;
          padding: 32px;
          transition: all var(--transition-base);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .editorial-product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
        }
        .product-img-container {
          aspect-ratio: 1 / 1;
          background: var(--color-off-white);
          border: 1px solid rgba(212, 175, 55, 0.12);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-img-container img {
          max-height: 80%;
          width: auto;
          object-fit: contain;
          transition: transform var(--transition-slow);
        }
        .editorial-product-card:hover .product-img-container img {
          transform: scale(1.05);
        }
        .product-info {
          text-align: center;
          flex-grow: 1;
        }
        .product-name {
          font-family: var(--font-body);
          font-size: 20px;
          color: var(--color-charcoal);
          font-weight: 500;
          letter-spacing: -0.3px;
          margin-bottom: 8px;
        }
        .product-price {
          font-family: var(--font-heading);
          font-size: 26px;
          color: var(--color-gold);
          font-weight: 600;
        }
        .btn-view-more {
          background: transparent;
          border: 2px solid var(--color-charcoal);
          color: var(--color-charcoal);
          font-family: var(--font-body);
          font-size: var(--font-size-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 14px 48px;
          transition: all var(--transition-base);
          text-decoration: none;
          display: inline-block;
          margin-top: 60px;
        }
        .btn-view-more:hover {
          background: var(--color-charcoal);
          color: #FFFFFF;
        }
        .card-quick-actions {
          position: absolute;
          top: 40px;
          right: 40px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          opacity: 0;
          transition: opacity var(--transition-base);
        }
        .editorial-product-card:hover .card-quick-actions {
          opacity: 1;
        }
        .btn-action {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(212, 175, 55, 0.2);
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-charcoal);
          transition: all var(--transition-fast);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .btn-action:hover {
          background: var(--color-gold);
          color: #fff;
          border-color: var(--color-gold);
        }
        @media (max-width: 1199px) {
          .new-arrivals-title { font-size: 42px; }
        }
      `}</style>

      <div className="container">
        <div className="new-arrivals-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="new-arrivals-title"
          >
            New Arrivals
          </motion.h2>
          <p className="new-arrivals-tagline">CURATED EXCELLENCE</p>
          <div className="gold-underline" />
        </div>

        <div className="row g-4 justify-content-center">
          <AnimatePresence mode="wait">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="col-12 col-md-6 col-lg-3">
                  <SkeletonCard />
                </div>
              ))
            ) : (
              products.map((product, i) => (
                <div key={product.id} className="col-12 col-md-6 col-lg-3">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="editorial-product-card"
                  >
                    <Link to={`/product/${product.id}`} className="text-decoration-none">
                      <div className="product-img-container">
                        <img 
                          src={product.imageGallery?.[0]} 
                          alt={product.name} 
                          loading="lazy"
                        />
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-price">₹{product.price?.toLocaleString()}</div>
                      </div>
                    </Link>
                    <div className="card-quick-actions">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const defaultVariant = product.variants?.[0] || null;
                          addItem({
                            ...product,
                            variants: defaultVariant ? {
                              size: defaultVariant.dialSize,
                              color: defaultVariant.colorName,
                              strap: defaultVariant.strap,
                              sku: defaultVariant.sku
                            } : null
                          });
                          toast.success(`${product.name} added to cart`);
                        }} 
                        className="btn-action"
                        title="Add to Cart"
                      >
                        <HiOutlineShoppingCart size={20} />
                      </button>
                    </div>
                  </motion.div>
                </div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="text-center">
          <Link to="/allcollection" className="btn-view-more">
            View More
          </Link>
        </div>
      </div>
    </section>
  );
}
