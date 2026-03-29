import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, change, prefix = '', suffix = '' }) => {
  const trendValue = trend?.value ?? (change !== undefined ? `${change >= 0 ? '+' : ''}${change}%` : undefined);
  const isUp = trend?.isUp ?? (change !== undefined ? change >= 0 : undefined);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
      className="glass p-4 h-100"
      style={{ cursor: 'default' }}
    >
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={22} style={{ color: '#374151' }} />
        </div>
        {trendValue !== undefined && (
          <span
            className="badge rounded-pill fw-semibold"
            style={{
              fontSize: '11px',
              background: isUp ? '#D1FAE5' : '#FEE2E2',
              color: isUp ? '#065F46' : '#991B1B',
              padding: '5px 10px',
            }}
          >
            {trendValue}
          </span>
        )}
      </div>
      <p style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        {title}
      </p>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.1 }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
      </h2>
    </motion.div>
  );
};

export default StatCard;
