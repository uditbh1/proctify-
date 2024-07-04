const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // origin: "http://localhost:8000", // Replace with your client's origin
    origin: "*", // Replace with your client's origin
    methods: ["GET", "POST"]
  }
});

// Use CORS
app.use(cors({
  // origin: "http://localhost:8000" // Replace with your client's origin
  origin: "*", // Replace with your client's origin,
  credentials: true
}));

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate) => {
    socket.broadcast.emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, '0.0.0.0',() => {
  console.log('Server is running on port 3000');
});
