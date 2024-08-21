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
      receiveChannel.onmessage = (event) => {
        console.log("Received message:", event.data);
        const { x, y } = JSON.parse(event.data);
        this.createPhysicsSquare(x, y, false); // Indicate that this is a remote creation
      };
    };

    // Create data channel for sending messages
    this.dataChannel = peerConnection.createDataChannel("sendChannel");

    // Handle signaling for WebRTC
    socket.on("offer", async (offer) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("answer", answer);
    });

    socket.on("answer", async (answer) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding received ice candidate", e);
      }
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate);
      }
    };

    // Create an offer to connect to the other peer
    peerConnection.createOffer().then((offer) => {
      peerConnection.setLocalDescription(offer);
      socket.emit("offer", offer);
    });

    // Listen for user count updates
    socket.on("user-count", (count) => {
      document.getElementById("user-count").innerText = `Connected Users: ${count}`;
    });
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
