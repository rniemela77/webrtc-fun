const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

let clients = [];

io.on('connection', socket => {
  console.log('New client connected');
  clients.push(socket);

  socket.on('signal', data => {
    // Broadcast signaling data to all clients except the sender
    clients.forEach(client => {
      if (client !== socket) {
        client.emit('signal', data);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== socket);
  });
});

server.listen(3000, () => {
  console.log('Signaling server listening on port 3000');
});
