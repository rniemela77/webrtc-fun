const socket = io();
let peer;
let isInitiator = false;
let isConnected = false;

// Button to connect
document.getElementById('connect').addEventListener('click', () => {
    socket.emit('join-room');
});

socket.on('start-game', () => {
    console.log('Both players connected. Starting WebRTC signaling...');
    isInitiator = true;
    startWebRTC();
});

socket.on('signal', (data) => {
    console.log('Received signal from server:', data);
    if (peer) {
        peer.signal(data);  // Process the signal
    }
});

function startWebRTC() {
    const SimplePeer = window.SimplePeer;

    peer = new SimplePeer({
        initiator: isInitiator,
        trickle: false
    });

    peer.on('signal', data => {
        console.log('Sending signal to server:', data);
        socket.emit('signal', data);  // Send signal to server
    });

    peer.on('connect', () => {
        console.log('WebRTC Peer connected');
        isConnected = true;
        // Start game logic here
        startPongGame();
    });

    peer.on('data', (data) => {
        console.log('Received data:', data);
        // Handle game data here
    });

    peer.on('error', (err) => {
        console.error('WebRTC Peer error:', err);
    });

    peer.on('close', () => {
        console.log('WebRTC Peer disconnected');
        isConnected = false;
    });
}

function startPongGame() {
    console.log('Starting Pong game...');
    // Phaser game initialization here
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);
    let player1, player2, ball;

    function preload() {
        this.load.image('ball', 'assets/ball.png');
        this.load.image('paddle', 'assets/paddle.png');
    }

    function create() {
        player1 = this.physics.add.image(50, 300, 'paddle').setImmovable(true);
        player2 = this.physics.add.image(750, 300, 'paddle').setImmovable(true);
        ball = this.physics.add.image(400, 300, 'ball');

        this.physics.add.collider(ball, player1);
        this.physics.add.collider(ball, player2);

        ball.setVelocity(200, 200).setCollideWorldBounds(true).setBounce(1, 1);

        this.input.on('pointermove', (pointer) => {
            player1.y = pointer.y;
            if (isConnected) {
                peer.send(JSON.stringify({ player1Y: player1.y }));
            }
        });
    }

    function update() {
        if (isConnected && peer) {
            peer.on('data', (data) => {
                const parsedData = JSON.parse(data);
                player2.y = parsedData.player1Y;
            });
        }
    }
}
