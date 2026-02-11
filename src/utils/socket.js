import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const socketUrl = apiBaseUrl.replace('/api', '');

  socket = io(socketUrl, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket.io connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket.io disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const onStockUpdate = (callback) => {
  if (socket) {
    socket.on('stock-updated', callback);
  }
};

export const offStockUpdate = (callback) => {
  if (socket) {
    socket.off('stock-updated', callback);
  }
};
