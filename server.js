const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let connectedUsers = 0; // Variable to keep track of connected users

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle socket connections
io.on('connection', (socket) => {
  connectedUsers++;
  console.log('a user connected');
  io.emit('user-count', connectedUsers); // Emit user count

  if (connectedUsers === 2) {
    console.log('Two users are connected');
    io.emit('ready'); // Emit ready event
  }

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
    connectedUsers--;
	console.log('user disconnected');
    io.emit('user-count', connectedUsers); // Emit user count
  });

  // Add your custom socket event handlers here
  socket.on('message', (msg) => {
	console.log('message: ' + msg);
	io.emit('message', msg);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});