class Demo extends Phaser.Scene {
    preload() {
        console.log('Preloading assets...');
        this.load.image('particle', '/circle.png'); // Ensure the path is correct
    }

    create() {
        console.log('Creating scene...');
        // Add pointer down event to create a physics square
        this.input.on('pointerdown', (pointer) => {
            console.log('Pointer down at:', pointer.x, pointer.y);
            this.createPhysicsSquare(pointer.x, pointer.y);
        });

        // Setup WebRTC
        this.setupWebRTC();
    }

    createPhysicsSquare(x, y) {
        console.log('Creating physics square at:', x, y);
        // Create a physics-enabled square
        this.matter.add.rectangle(x, y, 50, 50, { restitution: 0.5 });
    }

    setupWebRTC() {
        console.log('Setting up WebRTC...');
        // Initialize WebRTC connection
        const peerConnection = new RTCPeerConnection();

        // Handle incoming data channel messages
        peerConnection.ondatachannel = (event) => {
            const receiveChannel = event.channel;
            receiveChannel.onmessage = (event) => {
                const { x, y } = JSON.parse(event.data);
                this.createPhysicsSquare(x, y);
            };
        };

        // Create data channel for sending messages
        const dataChannel = peerConnection.createDataChannel("squareChannel");

        // Example: Send a message to create a square at a random position
        dataChannel.onopen = () => {
            dataChannel.send(JSON.stringify({ x: Math.random() * width, y: Math.random() * height }));
        };

        // Example: Handle connection setup (offer/answer exchange)
        // This part would typically involve signaling server communication
        // For simplicity, we assume the connection is already established
    }
}

let width = window.innerWidth * window.devicePixelRatio;
let height = window.innerHeight * window.devicePixelRatio;

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: width,
    height: height,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'matter',
        matter: {
            debug: true, // Enable debug to see physics bodies
            gravity: { y: 0.5 } // Adjust gravity if needed
        }
    },
    scene: Demo,
    backgroundColor: '#8ccff',
};

var game = new Phaser.Game(config);