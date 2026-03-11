require('dotenv').config();
const http    = require('http');
const { Server } = require('socket.io');
const jwt     = require('jsonwebtoken');

const app     = require('./app');
const socketConfig = require('./config/socket');
const logger  = require('./utils/logger');

// ── HTTP Server ───────────────────────────────────────────
const server = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:  process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Socket authentication middleware — same JWT as REST
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized: no token provided.'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Unauthorized: invalid or expired token.'));
  }
});

// Store IO instance for service-layer access
socketConfig.init(io);

// Load socket event handlers
require('./sockets/chatSocket')(io);
require('./sockets/notificationSocket')(io);

// ── Start ─────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 JanSamadhan API running on http://localhost:${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
