/**
 * notificationSocket — joins users to their private rooms and admins to the admins room
 * Actual notification emission happens in notificationService.js and complaintService.js
 * @param {import('socket.io').Server} io
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    const user = socket.user;

    // Every user gets their private room
    socket.join(`user:${user.id}`);

    // Admins also get the shared admins room
    if (user.role === 'admin' || user.role === 'super_admin') {
      socket.join('admins');
    }
  });
};
