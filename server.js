const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join the "pong-room"
    socket.join('pong-room', () => {
        // Callback to ensure the join has completed
        console.log(`Client ${socket.id} joined pong-room.`);
        
        // Check the room details after joining
        const room = io.sockets.adapter.rooms['pong-room'];
        const numberOfClients = room ? room.length : 0;
        console.log('Current room details:', room);
        console.log(`Current number of clients in pong-room: ${numberOfClients}`);

        // Check if there are 2 clients in the room
        if (numberOfClients === 2) {
            console.log('Both players connected. Starting the game...');
            io.to('pong-room').emit('start-game');
        }
    });

    // Handle signaling
    socket.on('signal', (data) => {
        console.log(`Client ${socket.id} sent a signal:`, data);
        socket.to('pong-room').emit('signal', data);
        console.log(`Signal forwarded to pong-room from client ${socket.id}.`);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Leave the room upon disconnect
        socket.leave('pong-room', () => {
            console.log(`Client ${socket.id} left pong-room.`);
            const updatedRoom = io.sockets.adapter.rooms['pong-room'];
            const updatedNumberOfClients = updatedRoom ? updatedRoom.length : 0;
            console.log(`Clients in pong-room after disconnection: ${updatedNumberOfClients}`);
            
            if (updatedNumberOfClients < 2) {
                console.log('Waiting for another player to join...');
            }
        });
    });
});

// Start the server
server.listen(8080, '0.0.0.0', () => {
    console.log('Server listening on http://0.0.0.0:8080');
});
