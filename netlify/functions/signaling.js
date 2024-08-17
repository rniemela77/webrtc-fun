// netlify/functions/signaling.js
const { Server } = require('socket.io');
const { createServer } = require('http');

const server = createServer();
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.broadcast.emit('answer', data);
  });

  socket.on('candidate', (data) => {
    socket.broadcast.emit('candidate', data);
  });

  socket.on('click', (data) => {
    socket.broadcast.emit('click', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: 'Socket.IO server running',
  };
};
