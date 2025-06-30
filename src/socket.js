// import { io } from 'socket.io-client';

// // const socket = io('http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io');
// const socket = io('http://localhost:5000');
// socket.emit("user_connected", userId);
// export default socket;

import { io } from 'socket.io-client';

// Get the user ID from localStorage
let userId = null;
const storedUser = localStorage.getItem('user');

console.log("storedUser",storedUser)
if (storedUser) {
  try {
    const parsed = JSON.parse(storedUser);
    
console.log("storedUser",parsed._id)
    userId = parsed._id;
  } catch (err) {
    console.error("Error parsing user from localStorage", err);
  }
}

// Create the socket instance with `auth`
const socket = io('http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io', {
  transports: ['websocket'],
  auth: {
    userId,
  },
});

socket.on('connect', () => {
  console.log('Socket connected as:', userId, '->', socket.id);
});

export default socket;