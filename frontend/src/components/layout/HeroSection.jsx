import { motion } from 'framer-motion';

export default function HeroSection({ product }) {
  if (!product) return null;

  return (
    <section 
      className="position-relative overflow-hidden" 
      style={{ 
        minHeight: '88vh', 
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 0'
      }}
    >
      {/* Background Glow */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: '60%',
          height: '60%',
          transform: 'translateY(-50%)',
          background: 'radial-gradient(ellipse 60% 60% at 70% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="container position-relative z-1">
        <div className="row align-items-center">
          
          {/* LEFT COLUMN: Content */}
          <div className="col-lg-7 mb-5 mb-lg-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="section-label mb-4">
                Since 2024 · Premium Horology
              </div>
              
              <h1 
                className="font-display mb-4" 
                style={{ 
                  fontSize: 'clamp(3.5rem, 8vw, 7rem)', 
                  lineHeight: 1.02, 
                  color: '#ffffff',
                  fontStyle: 'italic'
                }}
              >
                "Time is the<br />only true luxury."
              </h1>
              
              <p 
                className="font-body mb-5" 
                style={{ 
                  fontSize: '1.2rem', 
                  color: '#9A9690', 
                  maxWidth: '480px' 
                }}
              >
                Curated timepieces for the discerning collector. Discover engineering excellence and timeless design.
              </p>
              
              <div className="d-flex flex-wrap gap-3 mb-5">
                <button 
                  onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}
                  className="btn-gold"
                >
                  Explore Collection
                </button>
              </div>
              
              <div className="d-flex align-items-center gap-4 py-4 mt-2" style={{ borderTop: '1px solid #1a1a1a' }}>
                <div className="d-flex align-items-center gap-2">
                  <span style={{ color: '#D4AF37' }}>⌚</span>
                  <span className="font-body" style={{ color: '#5A5652', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>6 Exceptional Pieces</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span style={{ color: '#D4AF37' }}>🛡</span>
                  <span className="font-body" style={{ color: '#5A5652', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>2-Year Warranty</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span style={{ color: '#D4AF37' }}>🚚</span>
                  <span className="font-body" style={{ color: '#5A5652', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Complimentary Shipping</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Product Image */}
          <div className="col-lg-5 position-relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="position-relative d-flex align-items-center justify-content-center"
            >
              {/* Blurred Glow behind image */}
              <div 
                style={{
                  position: 'absolute',
                  width: '400px',
                  height: '400px',
                  background: 'rgba(212,175,55,0.08)',
                  filter: 'blur(80px)',
                  borderRadius: '50%',
                  zIndex: -1
                }}
              />
              
              <motion.img 
                src={product.imageGallery[0]} 
                alt={product.name}
                className="img-fluid"
                style={{ 
                  maxHeight: '70vh', 
                  filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))' 
                }}
                animate={{ 
                  y: [0, -15, 0],
                  rotateY: [0, 5, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
