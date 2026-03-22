import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '60px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '4rem',
          fontWeight: 500, color: '#D4AF37', lineHeight: 1, marginBottom: 16 }}>
          404
        </p>
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif',
          fontSize: '2rem', fontWeight: 400, color: '#F0EDE8', marginBottom: 12 }}>
          Timepiece Not Found
        </h2>
        <p style={{ color: '#9A9690', marginBottom: 32, fontSize: '0.9rem' }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="btn-chronix-primary py-3 px-5 text-decoration-none">
          Return to Collection
        </Link>
      </motion.div>
    </div>
  );
}
