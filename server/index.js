require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const { log } = require('./utils/logger');

// Socket.io connection handler
const userSockets = new Map(); // username -> socketId

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('register_socket', (username) => {
    userSockets.set(username, socket.id);
    log('SOCKET_REGISTER', { username, socketId: socket.id });
    console.log(`User registered: ${username} -> ${socket.id}`);
  });

  socket.on('send_message', (data) => {
    // data: { to, type, sender, ciphertext/ephemeralPublicKey, ... }
    console.log(`[DEBUG] Received message from ${data.sender} to ${data.to} (Type: ${data.type})`);

    // Case-insensitive lookup attempt
    let recipientSocketId = userSockets.get(data.to);

    if (!recipientSocketId) {
      // Try to find case-insensitive match
      for (const [key, value] of userSockets.entries()) {
        if (key.toLowerCase() === data.to.toLowerCase()) {
          recipientSocketId = value;
          console.log(`[DEBUG] Found case-insensitive match: ${key} -> ${data.to}`);
          break;
        }
      }
    }

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_message', data);
      console.log(`[SUCCESS] Message sent from ${data.sender} to ${data.to} (${recipientSocketId})`);
    } else {
      console.log(`[ERROR] User ${data.to} not found or offline. Available users:`, Array.from(userSockets.keys()));
      // Optionally store offline messages
    }
  });

  socket.on('disconnect', () => {
    // Remove user from map
    for (const [user, id] of userSockets.entries()) {
      if (id === socket.id) {
        userSockets.delete(user);
        console.log(`User disconnected: ${user}`);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
