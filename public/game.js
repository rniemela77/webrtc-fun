class Demo extends Phaser.Scene {
  preload() {
    console.log("Preloading assets...");
    this.load.image("particle", "/circle.png"); // Ensure the path is correct
  }

  create() {
    console.log("Creating scene...");
    // Add pointer down event to create a physics square
    this.input.on("pointerdown", (pointer) => {
      console.log("Pointer down at:", pointer.x, pointer.y);
      this.createPhysicsSquare(pointer.x, pointer.y);
    });

    // Setup WebRTC
    this.setupWebRTC();
  }

  createPhysicsSquare(x, y, isLocal = true) {
    console.log("Creating physics square at:", x, y);
    // Create a physics-enabled square
    this.matter.add.rectangle(x, y, 50, 50, { restitution: 0.5 });

    // Send the square's coordinates through the data channel if it is a local creation
    if (isLocal && this.dataChannel && this.dataChannel.readyState === "open") {
      const message = JSON.stringify({ x, y });
      this.dataChannel.send(message);
      console.log("Sent message:", message);
    }
  }

  setupWebRTC() {
    console.log("Setting up WebRTC...");
    const peerConnection = new RTCPeerConnection();
    const socket = io();

    // Handle incoming data channel messages
    peerConnection.ondatachannel = (event) => {
      console.log("Data channel created!");
      const receiveChannel = event.channel;

      this.createPhysicsSquare(200, 200, false); // drop a block if both players are connected
      receiveChannel.onmessage = (event) => {
        console.log("Received message:", event.data);
        const { x, y } = JSON.parse(event.data);
        this.createPhysicsSquare(x, y, false); // Indicate that this is a remote creation
      };
    };

    // Create data channel for sending messages
    this.dataChannel = peerConnection.createDataChannel("sendChannel");

    // Handle signaling for WebRTC
    const handleOffer = async (offer) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("answer", answer);
    };

    const handleAnswer = async (answer) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    };

    const handleIceCandidate = async (candidate) => {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding received ice candidate", e);
      }
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate);
      }
    };

    // Create an offer to connect to the other peer
    const createOffer = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", offer);
    };

    createOffer();

    // Listen for user count updates
    socket.on("user-count", (count) => {
      document.getElementById(
        "user-count"
      ).innerText = `Connected Users: ${count}`;
    });

    // Listen for ready event
    socket.on("ready", () => {
      const readyMessage = document.createElement("div");
      readyMessage.id = "ready-message";
      readyMessage.innerText = "Both players are ready!";
      readyMessage.style.position = "absolute";
      readyMessage.style.top = "50%";
      readyMessage.style.left = "50%";
      readyMessage.style.transform = "translate(-50%, -50%)";
      readyMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      readyMessage.style.color = "white";
      readyMessage.style.padding = "20px";
      readyMessage.style.borderRadius = "10px";
      document.body.appendChild(readyMessage);

      // Remove the message after a few seconds
      setTimeout(() => {
        document.body.removeChild(readyMessage);
      }, 3000);
    });

    // Ensure both peers are connected before showing the ready message
    const checkConnection = () => {
      if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
        socket.emit('ready');
      }
    };

    peerConnection.oniceconnectionstatechange = checkConnection;
  }
}

let width = window.innerWidth * window.devicePixelRatio;
let height = window.innerHeight * window.devicePixelRatio;

var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: width,
  height: height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "matter",
    matter: {
      debug: true, // Enable debug to see physics bodies
      gravity: { y: 0.5 }, // Adjust gravity if needed
    },
  },
  scene: Demo,
  backgroundColor: "#8ccff",
};

var game = new Phaser.Game(config);
