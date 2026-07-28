let activeSocketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socket = null;

export const initSocket = async (user) => {
  if (socket) return socket;

  try {
    const { io } = await import('socket.io-client');
    socket = io(activeSocketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log('Connected to Chrona Socket.IO server:', socket.id);
      if (user) {
        socket.emit('user_connect', user);
      }
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket.IO connection notice:', err.message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Chrona Socket.IO server');
    });
  } catch (err) {
    console.warn('Socket.IO module loading or connection fallback:', err.message);
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    if (typeof socket.disconnect === 'function') {
      socket.disconnect();
    }
    socket = null;
  }
};
