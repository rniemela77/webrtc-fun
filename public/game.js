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
      .setAlpha(0.1);

    this.car = this.physics.add.image(width / 2, height / 2, "car").setAngle(-90);
    this.car.body.angularDrag = 120;
    this.car.body.maxSpeed = 100;
    this.car.body.setSize(20, 20, true);
    this.car.setScale(0.2);

    this.throttle = 100;
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.car);
    this.car.setCollideWorldBounds(true);

    this.setupWebRTC();

    this.createTunnel();
  }

  createTunnel() {
    this.graphics = this.add.graphics();
    // Create a path for the top of the tunnel
    const topStartY = Phaser.Math.Between(200, 100);
    this.topPath = new Phaser.Curves.Path(0, topStartY); 
    // Create a path for the bottom of the tunnel
    const bottomStartY = Phaser.Math.Between(250, 200);
    this.bottomPath = new Phaser.Curves.Path(0, bottomStartY); 

    // Randomize the starting point for the top & bottom path
    let ty = topStartY;
    let by = bottomStartY;

    const tunnelWidth = 200;
    const tunnelHeightRange = {
      top: { min: 100, max: 200 },
      bottom: { min: 400, max: 500 }
    };

    for (let x = tunnelWidth; x <= 1000; x += tunnelWidth) {
      this.topPath.lineTo(x, ty);
      this.bottomPath.lineTo(x, by);
      ty = Phaser.Math.Between(tunnelHeightRange.top.min, tunnelHeightRange.top.max);
      by = Phaser.Math.Between(tunnelHeightRange.bottom.min, tunnelHeightRange.bottom.max);
    }

    this.offset = 0;
  }

  updateTunnel() {
    const speed = 2;
    this.cameras.main.scrollX += speed;
    this.offset += speed;

    if (this.offset >= 200) {
      let ty = Phaser.Math.Between(200, 100);
      let by = Phaser.Math.Between(400, 500);

      const topEnd = this.topPath.getEndPoint();
      const bottomEnd = this.bottomPath.getEndPoint();

      this.topPath.lineTo(topEnd.x + 200, ty);
      this.bottomPath.lineTo(bottomEnd.x + 200, by);

      this.offset = 0;
    }

    const carX = this.car.x - this.cameras.main.scrollX;
    const top = this.topPath.getPoint(carX / 1000);
    const bottom = this.bottomPath.getPoint(carX / 1000);

    this.graphics.clear();
    this.graphics.lineStyle(2, 0xffffff, 1);
    this.topPath.draw(this.graphics);
    this.bottomPath.draw(this.graphics);

    if (this.car.y < top.y + 20 || this.car.y > bottom.y - 20) {
      this.throttle -= this.throttle > 50 ? 1 : 0; // Reduce speed if the car is near the tunnel walls
      this.car.setTint(0xff0000); // Visual feedback for hitting the wall
    } else {
      this.throttle += this.throttle < 100 ? 1 : 0; // Increase speed if the car is in the middle of the tunnel
      this.car.clearTint();
    }
  }

  update() {
    this.updateTunnel();

    this.cameras.main.setFollowOffset(
      Math.cos(this.car.rotation) * -64,
      Math.sin(this.car.rotation) * -64
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

    this.cameras.main.setRotation(-this.car.rotation - Math.PI / 2);
    // this.cameras.main.setZoom(3);

    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const data = JSON.stringify({
        x: this.car.x,
        y: this.car.y,
        rotation: this.car.rotation
      });
      this.dataChannel.send(data);
    }
  }

  setupWebRTC() {
    // WebRTC setup code as before
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
