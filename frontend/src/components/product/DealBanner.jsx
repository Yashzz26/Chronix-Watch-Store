import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineTicket } from 'react-icons/hi2';

export default function DealBanner({ product }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end - now;
      if (diff <= 0) return clearInterval(timer);
      setTimeLeft({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!product) return null;

  const pad = (n) => String(n).padStart(2, '0');
  const discountPercent = Math.round((1 - product.dealPrice / product.price) * 100);

  return (
    <section className="position-relative overflow-hidden mb-5" style={{ borderRadius: '16px', border: '1px solid rgba(212,175,55,0.15)' }}>
      {/* Shimmer Line */}
      <div 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          zIndex: 2
        }}
      />
      
      <div 
        className="p-5"
        style={{ 
          background: 'linear-gradient(135deg, #0c0c0c 0%, #0f0b00 100%)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="row w-100 g-4 align-items-center">
          <div className="col-md-6 order-2 order-md-1">
            <div className="section-label mb-3">Limited offer</div>
            <h2 className="font-display mb-2" style={{ fontSize: '2.5rem', color: '#fff' }}>Deal of the day</h2>
            <h3 className="h4 text-t2 mb-4">{product.name}</h3>
            
            <div className="d-flex align-items-center gap-4 mb-5">
              <div className="d-flex flex-column">
                <span style={{ fontSize: '0.7rem', color: '#5A5652', textTransform: 'uppercase' }}>Exclusive Price</span>
                <span className="font-mono text-gold h2 m-0">₹{product.dealPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex flex-column opacity-50">
                <span style={{ fontSize: '0.7rem', color: '#5A5652', textTransform: 'uppercase' }}>Standard</span>
                <span className="font-mono text-t3 h4 m-0 text-decoration-line-through">₹{product.price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="d-flex gap-4">
              <div className="text-center">
                <div className="font-mono text-white h1 mb-0" style={{ fontSize: '2.5rem' }}>{pad(timeLeft.h)}</div>
                <div style={{ fontSize: '0.6rem', color: '#5A5652', textTransform: 'uppercase' }}>Hours</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-white h1 mb-0" style={{ fontSize: '2.5rem' }}>{pad(timeLeft.m)}</div>
                <div style={{ fontSize: '0.6rem', color: '#5A5652', textTransform: 'uppercase' }}>Mins</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-gold h1 mb-0" style={{ fontSize: '2.5rem' }}>{pad(timeLeft.s)}</div>
                <div style={{ fontSize: '0.6rem', color: '#5A5652', textTransform: 'uppercase' }}>Secs</div>
              </div>
            </div>

            <div className="mt-5">
                <Link to={`/product/${product.id}`} className="btn-gold text-decoration-none">
                    Shop this watch
                </Link>
            </div>
          </div>
          
          <div className="col-md-6 order-1 order-md-2 text-center position-relative">
            <div className="position-absolute top-50 start-50 translate-middle bg-gold opacity-10 rounded-circle" style={{ width: '100%', height: '100%', filter: 'blur(100px)', zIndex: 0 }} />
            <motion.img 
              src={product.imageGallery[0]} 
              alt={product.name}
              style={{ maxHeight: '340px', filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.8))', position: 'relative', zIndex: 1 }}
              animate={{ rotate: [0, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

