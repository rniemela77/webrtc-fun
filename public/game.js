class Demo extends Phaser.Scene {
  preload() {
    console.log("Preloading assets...");
    this.load.image("particle", "/circle.png"); // Ensure the path is correct
  }

  create() {
    // boundaries
    this.matter.world.setBounds(0, 0, width, height);
    // physics



    console.log("Creating scene...");
    
    this.input.on("pointerdown", (pointer) => {
      console.log("Pointer down at:", pointer.x, pointer.y);
      const xPercent = (pointer.x / this.scale.width) * 100;
      const yPercent = (pointer.y / this.scale.height) * 100;
      this.createPhysicsSquare(xPercent, yPercent);
    });

    // every 1s
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        // const xPercent = Math.random() * 100;
        // const yPercent = Math.random() * 100;
        // this.createPhysicsSquare(xPercent, yPercent);
      },
    });

    this.setupWebRTC();
  }

  createPhysicsSquare(xPercent, yPercent, isLocal = true) {
    const x = (xPercent / 100) * this.scale.width;
    const y = (yPercent / 100) * this.scale.height;
    const squareSize = this.scale.width / 10;
    console.log("Creating physics square at:", x, y);
    const square = this.matter.add.image(x, y, "particle", null, {
      shape: {
        type: "circle",
        radius: squareSize / 2,
      },
    });

    // physics
    square.setFriction(0.005);
    square.setBounce(0.8);
    square.setMass(20000);

    // if not local, add a random force
    if (!isLocal) {
      // make it red
      square.setTint(0xff0000);
    }

    if (isLocal && this.dataChannel?.readyState === "open") {
      const message = JSON.stringify({ xPercent, yPercent });
      this.dataChannel.send(message);
      console.log("Sent message:", message);
    }
  }

  setupWebRTC() {
    console.log("Setting up WebRTC...");
    const peerConnection = new RTCPeerConnection();
    const socket = io();

    peerConnection.ondatachannel = (event) => {
      console.log("Data channel created!");
      const receiveChannel = event.channel;

      this.createPhysicsSquare(200, 200, false);
      receiveChannel.onmessage = (event) => {
        console.log("Received message:", event.data);
        const { xPercent, yPercent } = JSON.parse(event.data);
        this.createPhysicsSquare(xPercent, yPercent, false);
      };
    };

    this.dataChannel = peerConnection.createDataChannel("sendChannel");

    const handleOffer = async (offer) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("answer", answer);
    };

    const handleAnswer = async (answer) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = async (candidate) => {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding received ICE candidate", e);
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

    const createOffer = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", offer);
    };

    createOffer();

    socket.on("user-count", (count) => {
      document.getElementById("user-count").innerText = `Connected Users: ${count}`;
    });

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

      setTimeout(() => document.body.removeChild(readyMessage), 3000);
    });

    peerConnection.oniceconnectionstatechange = () => {
      if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
        socket.emit('ready');
      }
    };
  }
}

const width = window.innerWidth * window.devicePixelRatio;
const height = window.innerHeight * window.devicePixelRatio;

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width,
  height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "matter",
    matter: {
      debug: true,
      gravity: { y: 0.5 },
    },
  },
  scene: Demo,
  backgroundColor: "#8ccff",
};

const game = new Phaser.Game(config);
