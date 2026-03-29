import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, change, prefix = '', suffix = '' }) => {
  // Support both old `change` (number) and new `trend` ({ value, isUp }) prop
  const trendValue = trend?.value ?? (change !== undefined ? `${change >= 0 ? '+' : ''}${change}%` : undefined);
  const isUp = trend?.isUp ?? (change !== undefined ? change >= 0 : undefined);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(245,166,35,0.15)' }}
      transition={{ duration: 0.2 }}
      className="glass p-5 h-100"
      style={{ border: '1px solid rgba(245, 166, 35, 0.12)' }}
    >
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div
          className="p-3 rounded-3 border"
          style={{
            background: 'rgba(245,166,35,0.1)',
            borderColor: 'rgba(245,166,35,0.2)',
          }}
        >
          <Icon size={24} className="text-amber" />
        </div>
        {trendValue !== undefined && (
          <span
            className="badge rounded-pill fw-semibold"
            style={{
              fontSize: '11px',
              background: isUp ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: isUp ? '#15803D' : '#B91C1C',
            }}
          >
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-platinum small mb-2" style={{ fontWeight: 500 }}>{title}</p>
      <h2
        className="font-display fw-bold text-white mb-0"
        style={{ fontSize: '2.5rem', lineHeight: 1.1 }}
      >
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
      </h2>
    </motion.div>
  );
};

export default StatCard;
