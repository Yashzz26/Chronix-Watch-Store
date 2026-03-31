import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CategoryCard = ({ 
  image, 
  label, 
  title, 
  description, 
  link 
}) => {
  return (
    <Link to={link || "/allcollection"} className="category-card-link">
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
        }}
        className="category-card"
      >
        <div className="card-bg-wrap">
          <img src={image} className="card-bg-img" alt={title} />
          <div className="card-overlay" />
        </div>

        <div className="card-content">
          <span className="card-label">{label}</span>
          <h2 className="card-title" dangerouslySetInnerHTML={{ __html: title.split(' ').join('<br/>') }} />
          <p className="card-description">{description}</p>
          <div className="card-cta">View series</div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function ClassicSeries() {
  return (
    <section className="classic-series-section">
      <style>{`
        .classic-series-section {
          background: var(--bg);
          padding: var(--spacing-4xl) 32px;
        }

        .collection-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .category-card-link {
          text-decoration: none;
          display: block;
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .category-card {
          position: relative;
          aspect-ratio: 16 / 11;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px;
          background: #000000;
        }

        .card-bg-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .card-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
          transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .category-card-link:hover .card-bg-img {
          transform: scale(1.05);
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
        }

        .card-content {
          position: relative;
          z-index: 2;
          max-width: 480px;
        }

        .card-label {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 24px;
          display: block;
        }

        .card-title {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 5vw, 3.5rem);
          color: #FFFFFF;
          font-weight: 700;
          line-height: 1.05;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .card-description {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
        }

        .card-cta {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #FFFFFF;
          display: inline-block;
          border-bottom: 1.5px solid var(--gold);
          padding-bottom: 4px;
          transition: var(--transition);
        }

        .category-card-link:hover .card-cta {
          color: var(--gold);
          transform: translateY(-2px);
        }

        @media (max-width: 991px) {
          .collection-grid { grid-template-columns: 1fr; }
          .category-card { aspect-ratio: 16 / 10; padding: 32px; }
        }
      `}</style>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: { staggerChildren: 0.2 } 
          }
        }}
        className="collection-grid"
      >
        <CategoryCard 
          image="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856865/2151923179_ljyifn.jpg"
          label="Classic line"
          title="Classic Series"
          description="Everyday field pieces with slim bezels, brushed cases, and clear dials."
          link="/allcollection?cat=classic"
        />
        <CategoryCard 
          image="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856617/2151923179_si5iqe.jpg"
          label="Modern line"
          title="Modern Minimal"
          description="Ceramic accents, bolder typography, and quick-change straps for city wear."
          link="/allcollection?cat=modern"
        />
      </motion.div>
    </section>
  );
}

