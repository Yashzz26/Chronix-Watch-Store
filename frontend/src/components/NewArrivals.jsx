import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingCart, HiArrowLongRight } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import SkeletonCard from './ui/SkeletonCard';
import StarDisplay from './ui/StarDisplay';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function NewArrivals({ products, loading, addItem }) {
  return (
    <section className="home-arrivals">
      <div className="container">
        <div className="home-arrivals__header">
          <p className="home-eyebrow">Just landed</p>
          <h2>New arrivals</h2>
          <p className="home-lead">Pieces we regulated this week before sending to the studio.</p>
        </div>

        <motion.div
          className="home-arrivals__grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          <AnimatePresence>
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <motion.div key={`skeleton-${index}`} variants={containerVariants}>
                    <SkeletonCard />
                  </motion.div>
                ))
              : products.map((product) => (
                  <motion.article
                    key={product.id}
                    className="home-arrival-card"
                    variants={containerVariants}
                  >
                    <button
                      className="home-arrival-card__action"
                      onClick={(e) => {
                        e.preventDefault();
                        const defaultVariant = product.variants?.[0] || null;
                        addItem({
                          ...product,
                          variants: defaultVariant
                            ? {
                                size: defaultVariant.dialSize,
                                color: defaultVariant.colorName,
                                strap: defaultVariant.strap,
                                sku: defaultVariant.sku
                              }
                            : null
                        });
                        toast.success(`${product.name} added to cart`);
                      }}
                      title="Add to cart"
                    >
                      <HiOutlineShoppingCart size={18} />
                    </button>

                    <Link to={`/product/${product.id}`} className="home-arrival-card__img">
                      <img
                        src={product.imageGallery?.[0] || '/placeholder-watch.png'}
                        alt={product.name}
                        loading="lazy"
                      />
                    </Link>

                    <p className="home-arrival-card__meta">{product.category || 'Chronix Original'}</p>
                    <h3 className="home-arrival-card__name">{product.name}</h3>
                    <div style={{ marginBottom: 6 }}>
                      <StarDisplay rating={product.avgRating} count={product.reviewCount} size="0.7rem" />
                    </div>
                    <div className="home-arrival-card__price">
                      ?{product.price?.toLocaleString('en-IN')}
                    </div>
                  </motion.article>
                ))}
          </AnimatePresence>
        </motion.div>

        <div className="home-arrivals__footer">
          <Link to="/allcollection" className="subtle-link">
            Browse the full catalog <HiArrowLongRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

