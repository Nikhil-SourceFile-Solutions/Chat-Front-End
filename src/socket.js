// socket.js
import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId) => {
  if (socket) socket.disconnect();  // Disconnect existing socket if any

  socket = io('http://api.sourcefile.online', {
    transports: ['websocket'],
    auth: { userId },
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id, 'for user:', userId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export default getSocket;