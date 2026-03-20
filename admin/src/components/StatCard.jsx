import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, change, prefix = '', suffix = '' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="glass p-4 h-100 transition-all"
    style={{ border: '1px solid rgba(245, 166, 35, 0.1)' }}
  >
    <div className="d-flex justify-content-between align-items-start mb-3">
      <div className="p-2 bg-amber bg-opacity-10 rounded-3 border border-amber border-opacity-20">
        <Icon size={20} className="text-amber" />
      </div>
      {change !== undefined && (
        <span className={`badge rounded-pill fw-semibold ${change >= 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`} style={{ fontSize: '10px' }}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <p className="text-platinum small mb-1">{title}</p>
    <h3 className="font-display fw-bold text-white mb-0">
      {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
    </h3>
  </motion.div>
);

export default StatCard;
