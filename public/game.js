const VelocityFromRotation =
  Phaser.Physics.Arcade.ArcadePhysics.prototype.velocityFromRotation;

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
      .setScrollFactor(0, 0)
      .setAlpha(0.1);

    this.car = this.physics.add.image(50, 164, "car").setAngle(-90);
    this.car.body.angularDrag = 120;
    this.car.body.maxSpeed = 300;
    this.car.body.setSize(20, 20, true);

    this.throttle = 300;

    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.car);


    // Create obstacle in center
    this.obstacle = this.physics.add.image(width / 2, height / 2, "car").setScale(5.5).setImmovable(true);

    // Car collides with obstacle
    this.physics.add.collider(this.car, this.obstacle, () => {
      this.throttle -= 1;
    });
  }

  update(time, delta) {
    // Offset the camera to position the car slightly below the center
    this.cameras.main.setFollowOffset(
      // where the car is facing
      Math.cos(this.car.rotation) * -64,
      Math.sin(this.car.rotation) * -64
    );

    // Custom wrapping logic for the car
    this.wrapObject(this.car, 16);

    this.throttle = Phaser.Math.Clamp(this.throttle, -64, 1024);

    // if pointer is down
    if (this.input.activePointer.isDown) {
      const currentPointer = this.input.activePointer.x;

      // if its on left or right side of teh screen
      if (currentPointer < width / 2) {
        this.car.body.setAngularAcceleration(
          -360 - this.car.body.angularVelocity 
        );
      } else if (currentPointer > width / 2) {
        this.car.body.setAngularAcceleration(360);
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
      (90 * this.car.body.speed) / 1024,
      0,
      90
    );

    const { scrollX, scrollY } = this.cameras.main;
    this.ground.setTilePosition(scrollX, scrollY);

    // Rotate camera to face car
    this.cameras.main.setRotation(-this.car.rotation - Math.PI / 2);

    // zoom
    this.cameras.main.setZoom(2);
  }

  wrapObject(sprite, padding = 0) {
    const halfWidth = sprite.displayWidth / 2;
    const halfHeight = sprite.displayHeight / 2;

    if (sprite.x + halfWidth < -padding) {
      sprite.x = width + halfWidth;
    } else if (sprite.x - halfWidth > width + padding) {
      sprite.x = -halfWidth;
    }

    if (sprite.y + halfHeight < -padding) {
      sprite.y = height + halfHeight;
    } else if (sprite.y - halfHeight > height + padding) {
      sprite.y = -halfHeight;
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
