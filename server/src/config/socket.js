let _io;

module.exports = {
  init: (io) => {
    _io = io;
  },
  getIO: () => {
    if (!_io) throw new Error('Socket.IO not initialized. Call init(io) first.');
    return _io;
  },
};
