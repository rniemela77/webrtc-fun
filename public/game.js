const VelocityFromRotation = Phaser.Physics.Arcade.ArcadePhysics.prototype.velocityFromRotation;

class Racer extends Phaser.Scene {
  constructor() {
    super({ key: "Racer" });
  }

  preload() {
    this.load.image("soil", "assets/textures/soil.png");
    this.load.image("car", "assets/sprites/car-yellow.png");
  }

  create() {
    this.ground = this.add
      .tileSprite(width / 2, height / 2, width, height, "soil")
      // .setScrollFactor(1, 1)
      .setAlpha(0.1);

    this.car = this.physics.add.image(50, 164, "car").setAngle(-90);
    this.car.body.angularDrag = 120;
    this.car.body.maxSpeed = 100;
    this.car.body.setSize(20, 20, true);
    this.car.setScale(0.5);

    this.throttle = 50;
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.car);

    this.obstacle = this.physics.add.image(width / 2, height / 2, "car").setScale(5.5).setImmovable(true);
    this.physics.add.collider(this.car, this.obstacle, () => {
      this.throttle -= 1;
    });

    // car collides with world bounds
    this.car.setCollideWorldBounds(true);

    this.setupWebRTC();
  }

  update() {
    this.cameras.main.setFollowOffset(
      Math.cos(this.car.rotation) * -164,
      Math.sin(this.car.rotation) * -164
    );

    this.throttle = Phaser.Math.Clamp(this.throttle, -64, 1024);

    if (this.input.activePointer.isDown) {
      const currentPointer = this.input.activePointer.x;

      if (currentPointer < width / 2) {
        this.car.body.setAngularAcceleration(-1360);
      } else if (currentPointer > width / 2) {
        this.car.body.setAngularAcceleration(1360);
      }
    } else {
      this.car.body.setAngularAcceleration(0);
    }

    VelocityFromRotation(
      this.car.rotation,
      this.throttle,
      this.car.body.velocity
    );
    this.car.body.maxAngular = Phaser.Math.Clamp(
      (90 * this.car.body.speed) / 104,
      0,
      90
    );

    const { scrollX, scrollY } = this.cameras.main;
    this.ground.setTilePosition(scrollX, scrollY);

    this.cameras.main.setRotation(-this.car.rotation - Math.PI / 2);
    this.cameras.main.setZoom(1);

    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const data = JSON.stringify({
        x: this.car.x,
        y: this.car.y,
        rotation: this.car.rotation
      });
      console.log('Sending data:', data);
      this.dataChannel.send(data);
    }
  }
  setupWebRTC() {

    const signalingServerUrl = 'http://localhost:3000'; // Update with your signaling server URL
    const socket = io(signalingServerUrl);

    this.peerConnection = new RTCPeerConnection();
    this.dataChannel = this.peerConnection.createDataChannel('game-data');
    
    this.dataChannel.onopen = () => {
      console.log('Data channel is open.');
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel is closed.');
    };

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };

    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log('Sending ICE candidate:', event.candidate);
        socket.emit('signal', { type: 'ice-candidate', candidate: event.candidate });
      }
    };

    this.peerConnection.ondatachannel = event => {
      const receiveChannel = event.channel;
      receiveChannel.onmessage = e => {
        console.log('Received data:', e.data);
        try {
          const { x, y, rotation } = JSON.parse(e.data);

          if (!this.otherCar) {
            // Create a new car for the other player if it doesn't exist
            this.otherCar = this.physics.add.image(x, y, 'car').setAngle(rotation);
            this.otherCar.setSize(20, 20, true);
            this.otherCar.setAlpha(0.7);
          } else {
            this.otherCar.setPosition(x, y);
            this.otherCar.setRotation(rotation);
          }
        } catch (error) {
          console.error('Error parsing received data:', error);
        }
      };
    };

    socket.on('signal', async (data) => {
      if (data.type === 'offer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        socket.emit('signal', { type: 'answer', answer });
      } else if (data.type === 'answer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.type === 'ice-candidate') {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('Error adding received ice candidate', error);
        }
      }
    });

    // Determine if this browser is the initiator
    const isInitiator = new URLSearchParams(window.location.search).get('initiator') === 'true';
    if (isInitiator) {
      this.peerConnection.onnegotiationneeded = async () => {
        try {
          const offer = await this.peerConnection.createOffer();
          await this.peerConnection.setLocalDescription(offer);
          socket.emit('signal', { type: 'offer', offer });
        } catch (error) {
          console.error('Error creating offer', error);
        }
      };
    }
  }
}

const width = window.innerWidth;
const height = window.innerHeight;

const config = {
  type: Phaser.AUTO,
  width: width,
  height: height,
  pixelArt: true,
  parent: "phaser-example",
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: Racer,
};

const game = new Phaser.Game(config);
