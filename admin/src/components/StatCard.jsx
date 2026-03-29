import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, change, prefix = '', suffix = '' }) => {
  const trendValue = trend?.value ?? (change !== undefined ? `${change >= 0 ? '+' : ''}${change}%` : undefined);
  const isUp = trend?.isUp ?? (change !== undefined ? change >= 0 : undefined);

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.18 }}
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
        border: '1px solid #E5E7EB',
        borderRadius: '14px',
        padding: '22px 24px',
        height: '100%',
        cursor: 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Top row: icon + trend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} style={{ color: '#374151' }} />
        </div>
        {trendValue !== undefined && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '11px',
              fontWeight: 700,
              background: isUp ? '#D1FAE5' : '#FEE2E2',
              color: isUp ? '#065F46' : '#991B1B',
              padding: '4px 10px',
              borderRadius: '999px',
            }}
          >
            {trendValue}
          </span>
        )}
      </div>

      {/* Label — small uppercase */}
      <p style={{
        fontSize: '11px',
        fontWeight: 700,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: '6px',
        margin: '0 0 6px',
      }}>
        {title}
      </p>

      {/* Value — dominates */}
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: '#111827',
        marginBottom: 0,
        fontFamily: 'DM Sans, sans-serif',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
      </h2>
    </motion.div>
  );
};

export default StatCard;
