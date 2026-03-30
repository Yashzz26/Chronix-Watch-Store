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
        className="category-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <style>{`
          .category-card-link {
            text-decoration: none;
            display: block;
          }
          .category-card {
            position: relative;
            aspect-ratio: 1 / 1;
            overflow: hidden;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-2xl);
            text-align: center;
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
            transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .category-card:hover .card-bg-img {
            transform: scale(1.1);
          }

          .card-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
            transition: background 0.5s ease;
          }

          .category-card:hover .card-overlay {
            background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.9) 100%);
          }

          .card-content {
            position: relative;
            z-index: 2;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .card-label {
            font-family: var(--font-body);
            font-size: 11px;
            color: rgba(255, 255, 255, 0.6);
            text-transform: uppercase;
            letter-spacing: 4px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .card-title {
            font-family: var(--font-heading);
            font-size: clamp(36px, 6vw, 76px);
            color: #FFFFFF;
            font-weight: 500;
            line-height: 0.95;
            margin: 0;
            letter-spacing: -2px;
            max-width: 90%;
            text-transform: none;
          }

          .card-description {
            font-family: var(--font-body);
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            line-height: 1.6;
            margin-top: 24px;
            max-width: 280px;
          }

          @media (max-width: 1200px) {
            .card-title { font-size: 56px; }
          }

          @media (max-width: 768px) {
            .category-card { padding: var(--spacing-xl); }
            .card-title { font-size: 40px; }
            .card-description { font-size: 13px; margin-top: 16px; }
          }
        `}</style>
        
        <div className="card-bg-wrap">
          <img src={image} className="card-bg-img" alt={title} />
          <div className="card-overlay" />
        </div>

        <div className="card-content">
          <span className="card-label">{label}</span>
          <h2 className="card-title" dangerouslySetInnerHTML={{ __html: title.replace(' ', '<br/>') }} />
          <p className="card-description">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
};

export default function ClassicSeries() {
  return (
    <section className="editorial-collection-section">
      <style>{`
        .editorial-collection-section {
          background: #FFFFFF;
          padding: var(--spacing-4xl) 0;
        }
        .collection-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-2xl);
        }
        @media (max-width: 991px) {
          .collection-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 0 var(--spacing-md);
          }
        }
      `}</style>

      <div className="collection-grid">
        <CategoryCard 
          image="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856865/2151923179_ljyifn.jpg"
          label="LIMITED EDITION"
          title="The Classic Series"
          description="Explore the foundation of our archival collection."
          link="/allcollection?cat=classic"
        />
        <CategoryCard 
          image="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856617/2151923179_si5iqe.jpg"
          label="TECHNICAL CRAFT"
          title="Modern Minimalism"
          description="Engineered for the contemporary landscape."
          link="/allcollection?cat=modern"
        />
      </div>
    </section>
  );
}
