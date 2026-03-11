import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Connect (or reuse) the Socket.IO connection, authenticated with JWT.
 */
export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  // If already connected, return existing socket
  if (socket?.connected) return socket;

  // If a stale socket exists, remove it
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️ Socket connect error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  return socket;
};

/**
 * Get the current socket instance (connect if needed).
 */
export const getSocket = () => {
  if (socket?.connected) return socket;
  return connectSocket();
};

/**
 * Disconnect and clear the socket (call on logout).
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
