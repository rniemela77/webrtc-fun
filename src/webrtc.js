const signalingServerUrl = 'ws://localhost:3000';
let peerConnections = {};
let localStream;

function startWebRTCConnection(peerId) {
    const peerConnection = new RTCPeerConnection();
    peerConnections[peerId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendSignalingMessage('ice', peerId, event.candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        // Handle remote stream
    };

    return peerConnection;
}

function handleSignalingMessage(message) {
    const { type, peerId, data } = message;

    if (type === 'offer') {
        const peerConnection = startWebRTCConnection(peerId);
        peerConnection.setRemoteDescription(new RTCSessionDescription(data));
        peerConnection.createAnswer().then((answer) => {
            return peerConnection.setLocalDescription(answer);
        }).then(() => {
            sendSignalingMessage('answer', peerId, peerConnection.localDescription);
        });
    } else if (type === 'answer') {
        const peerConnection = peerConnections[peerId];
        peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    } else if (type === 'ice') {
        const peerConnection = peerConnections[peerId];
        peerConnection.addIceCandidate(new RTCIceCandidate(data));
    }
}

function sendSignalingMessage(type, peerId, data) {
    const message = JSON.stringify({ type, peerId, data });
    signalingServer.send(message);
}

const signalingServer = new WebSocket(signalingServerUrl);
signalingServer.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleSignalingMessage(message);
};

export { startWebRTCConnection, handleSignalingMessage, sendSignalingMessage };
