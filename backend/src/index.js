require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chronix backend running', timestamp: new Date().toISOString() });
});

// Routes will be registered here in Phase 2
// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Chronix backend running on http://localhost:${PORT}`);
});
