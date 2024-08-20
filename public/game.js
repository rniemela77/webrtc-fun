class Demo extends Phaser.Scene {
  preload() {
    console.log("Preloading assets...");
    this.load.image("particle", "/circle.png"); // Ensure the path is correct
  }

  create() {
    // Setup WebRTC
    this.setupWebRTC();

    console.log("Creating scene...");
    // Add pointer down event to create a physics square
    this.input.on("pointerdown", (pointer) => {
      console.log("Pointer down at:", pointer.x, pointer.y);
      this.createPhysicsSquare(pointer.x, pointer.y, true); // Add a flag to indicate local creation
    });
  }

  createPhysicsSquare(x, y, isLocal = false) {
    console.log("Creating physics square at:", x, y);
    // Create a physics-enabled square
    this.matter.add.rectangle(x, y, 50, 50, { restitution: 0.5 });

    // If the square was created locally, send the coordinates to the other peer
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

    socket.on("connect", () => {
      console.log("Socket connected, setting up WebRTC...");

      // Handle incoming data channel messages
      peerConnection.ondatachannel = (event) => {
        console.log("Data channel created!");
        const receiveChannel = event.channel;
        receiveChannel.onmessage = (event) => {
          console.log("Received message:", event.data);
          const { x, y } = JSON.parse(event.data);
          this.createPhysicsSquare(x, y); // No need to resend this message
        };
      };

      // Create data channel for sending messages
      this.dataChannel = peerConnection.createDataChannel("squareChannel");

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate);
        }
      };

      // Handle incoming offers
      socket.on("offer", async (offer) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", answer);
      });

      // Handle incoming answers
      socket.on("answer", async (answer) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      // Handle incoming ICE candidates
      socket.on("ice-candidate", async (candidate) => {
        try {
          await peerConnection.addIceCandidate(candidate);
        } catch (e) {
          console.error("Error adding received ICE candidate", e);
        }
      });

      // Create an offer to initiate the connection
      peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer);
        socket.emit("offer", offer);
      });
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
