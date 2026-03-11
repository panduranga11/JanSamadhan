const chatService = require('../services/chatService');

/**
 * chatSocket — handles public_chat room
 * @param {import('socket.io').Server} io
 */
module.exports = (io) => {
  const broadcastOnlineCount = () => {
    io.to('public_chat').emit('onlineCount', {
      count: io.sockets.adapter.rooms.get('public_chat')?.size || 0,
    });
  };

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.id} (${user.role})`);

    // Join personal room + public chat room
    socket.join(`user:${user.id}`);
    socket.join('public_chat');

    // Broadcast updated count after join
    broadcastOnlineCount();

    // ── sendMessage ──────────────────────────────────────
    socket.on('sendMessage', async ({ text }) => {
      if (!text || !text.trim()) return;

      try {
        const saved = await chatService.saveMessage({
          userId:  user.id,
          message: text.trim(),
        });

        io.to('public_chat').emit('receiveMessage', {
          id:        saved.id,
          text:      saved.message,
          sender:    saved.sender,
          role:      saved.role,
          time:      saved.created_at,
          userId:    saved.user_id,
          avatarUrl: saved.avatar_url,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ── typing indicator ─────────────────────────────────
    socket.on('typing', () => {
      socket.to('public_chat').emit('userTyping', {
        userName: user.full_name || user.email,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.id}`);
      broadcastOnlineCount();
    });
  });
};
