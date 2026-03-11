require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const passport   = require('passport');
const helmet     = require('helmet');

// Passport Google strategy registration
require('./config/passport');

// Route imports
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const complaintRoutes    = require('./routes/complaintRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const superAdminRoutes   = require('./routes/superAdminRoutes');
const categoryRoutes     = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes         = require('./routes/chatRoutes');

const errorHandler   = require('./middleware/errorHandler');
const { generalLimiter, loginLimiter, registerLimiter } = require('./middleware/rateLimiter');

const app = express();

// ── Security Headers (Helmet) ─────────────────────────────
app.use(helmet());
// Disable strict CSP for dev (allows Vite HMR / inline scripts)
if (process.env.NODE_ENV !== 'production') {
  app.use(helmet.contentSecurityPolicy(false));
}

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Body Parsers (10mb limit to prevent oversized payloads) ─
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP Logger (dev only) ────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Passport ──────────────────────────────────────────────
app.use(passport.initialize());

// ── General Rate Limit ────────────────────────────────────
app.use('/api', generalLimiter);

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'JanSamadhan API is running.', timestamp: new Date() });
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/complaints',    complaintRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/superadmin',    superAdminRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat',          chatRoutes);

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Central Error Handler ─────────────────────────────────
app.use(errorHandler);

module.exports = app;
