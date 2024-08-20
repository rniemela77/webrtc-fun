import GameScene from './game.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scene: GameScene
};

const game = new Phaser.Game(config);

// Initialize WebRTC connections
import { startWebRTCConnection } from './webrtc.js';

// Example: Start WebRTC connection with a peer
const peerId = 'some-peer-id'; // You would get this ID from the signaling server
startWebRTCConnection(peerId);
