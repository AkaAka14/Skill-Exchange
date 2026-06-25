import { io } from 'socket.io-client';

let socket = null;


export function getSocket() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (socket && socket.connected) return socket;

  if (!socket) {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    socket = io(baseURL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });
  } else {
   
    socket.auth = { token };
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
