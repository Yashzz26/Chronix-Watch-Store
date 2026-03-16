import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function getMidnightCountdown() {
  const now = new Date();
  const midnight = new Date(); midnight.setHours(23, 59, 59, 999);
  const diff = midnight - now;
  return {
    h: String(Math.floor((diff / 3600000) % 24)).padStart(2, '0'),
    m: String(Math.floor((diff / 60000) % 60)).padStart(2, '0'),
    s: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
  };
}

const Digit = ({ value }) => (
  <div style={{
    background: '#0F0F0F', border: '1px solid #2A2A2A',
    borderRadius: 8, minWidth: 56, padding: '10px 8px', textAlign: 'center',
  }}>
    <span style={{
      fontFamily: '"DM Mono", monospace', fontSize: '1.8rem',
      fontWeight: 500, color: '#D4AF37', display: 'block', lineHeight: 1,
    }}>{value}</span>
  </div>
);

export default function DealBanner({ product }) {
  const [time, setTime] = useState(getMidnightCountdown());

  useEffect(() => {
    const interval = setInterval(() => setTime(getMidnightCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);

  const discount = product.dealPrice
    ? Math.round(((product.price - product.dealPrice) / product.price) * 100)
    : 0;

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #0F0D08 100%)',
      borderBottom: '1px solid #1A1A1A',
    }}>
      {/* Ambient radial glow */}
      <div style={{
        position: 'absolute', top: '30%', right: '10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(48px, 8vw, 96px) 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 60, alignItems: 'center',
      }}>
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative' }}
        >
          {discount > 0 && (
            <div style={{
              position: 'absolute', top: 16, left: 16, zIndex: 2,
              background: '#D4AF37', color: '#080808',
              fontWeight: 700, fontSize: '0.85rem',
              padding: '6px 12px', borderRadius: 6,
              fontFamily: '"DM Mono", monospace',
            }}>
              -{discount}%
            </div>
          )}
          <div style={{
            background: '#0F0F0F', border: '1px solid #2A2A2A',
            borderRadius: 16, padding: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            aspectRatio: '1 / 1',
          }}>
            <img src={product.imageGallery[0]} alt={product.name}
              style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="section-label" style={{ marginBottom: 12 }}>⚡ Deal of the Day</p>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 400, lineHeight: 1.1,
            color: '#F0EDE8', marginBottom: 16,
          }}>
            {product.name}
          </h2>
          <p style={{ color: '#9A9690', marginBottom: 28, lineHeight: 1.7, fontSize: '0.95rem', maxWidth: 420 }}>
            {product.description}
          </p>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 32 }}>
            <span style={{
              fontFamily: '"DM Mono", monospace', fontSize: '2.2rem',
              fontWeight: 500, color: '#D4AF37',
            }}>
              ₹{(product.dealPrice || product.price).toLocaleString('en-IN')}
            </span>
            {product.dealPrice && (
              <span style={{
                fontFamily: '"DM Mono", monospace', fontSize: '1.1rem',
                color: '#3A3A3A', textDecoration: 'line-through',
              }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Countdown */}
          <div style={{ marginBottom: 36 }}>
            <p style={{ color: '#5A5652', fontSize: '0.78rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 12 }}>
              Offer ends in
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Digit value={time.h} />
              <span style={{ color: '#D4AF37', fontFamily: '"DM Mono", monospace',
                fontSize: '1.4rem', marginBottom: 4 }}>:</span>
              <Digit value={time.m} />
              <span style={{ color: '#D4AF37', fontFamily: '"DM Mono", monospace',
                fontSize: '1.4rem', marginBottom: 4 }}>:</span>
              <Digit value={time.s} />
            </div>
            <p style={{ display: 'flex', gap: 32, marginTop: 6 }}>
              {['Hours','Min','Sec'].map(l => (
                <span key={l} style={{ fontSize: '0.7rem', color: '#3A3A3A',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  minWidth: 56, textAlign: 'center' }}>{l}</span>
              ))}
            </p>
          </div>

          <Link to={`/product/${product.id}`} className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              textDecoration: 'none', fontSize: '0.95rem' }}>
            Shop Now →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
