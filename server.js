const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app); // Create an HTTP server

const io = new Server(server, {
  cors: {
    origin: "*",  // Allow connections from any origin (or specify your frontend URL)
    methods: ["GET", "POST"]
  }
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Root route serves the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const users = {};

io.on('connection', socket => {
  console.log('A user connected');

  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });

  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
