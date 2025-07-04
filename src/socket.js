
import { io } from 'socket.io-client';


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

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  auth: {
    userId,
  },
});

socket.on('connect', () => {
  console.log('Socket connected as:', userId, '->', socket.id);
});

export default socket;