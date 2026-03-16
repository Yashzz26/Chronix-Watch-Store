import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Confirmation() {
  const orderId = 'CHX-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div style={{ textAlign: 'center', padding: '120px 24px' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(212,175,55,0.1)', border: '2px solid #D4AF37',
          color: '#D4AF37', fontSize: '2.5rem', margin: '0 auto 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>✓</div>

        <p className="section-label" style={{ marginBottom: 12 }}>Gratitude</p>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '3rem',
          fontWeight: 400, color: '#F0EDE8', marginBottom: 16 }}>
          Order Confirmed
        </h1>
        <p style={{ color: '#9A9690', fontSize: '1rem', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
          Your timepiece is being prepared for shipment. A confirmation email has been sent to your registered address.
        </p>

        <div className="card" style={{ padding: '16px 24px', display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <span style={{ color: '#5A5652', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID:</span>
          <span style={{ color: '#D4AF37', fontFamily: '"DM Mono", monospace', fontWeight: 600 }}>{orderId}</span>
        </div>

        <br />
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          Back to Collection
        </Link>
      </motion.div>
    </div>
  );
}
