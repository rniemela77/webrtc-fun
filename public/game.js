const VelocityFromRotation = Phaser.Physics.Arcade.ArcadePhysics.prototype.velocityFromRotation;

class Racer extends Phaser.Scene {
    constructor() {
        super({ key: 'Racer' });
    }

    preload() {
        this.load.image('soil', 'assets/textures/soil.png');
        this.load.image('car', 'assets/sprites/car-yellow.png');
    }

    create() {
        this.ground = this.add.tileSprite(width / 2, height / 2, 512, 512, 'soil').setScrollFactor(0, 0).setAlpha(0.1);

        this.car = this.physics.add.image(50, 164, 'car').setAngle(-90);
        this.car.body.angularDrag = 120;
        this.car.body.maxSpeed = 1024;
        this.car.body.setSize(null, null, true);
        
        this.throttle = 0;

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.cameras.main.startFollow(this.car);

        // create obstacle in center
        this.obstacle = this.physics.add.image(0, 0, 'car').setScale(5.5);
        // make immovable
        this.obstacle.body.immovable = true;

        // car collide with obstacle
        this.physics.add.collider(this.car, this.obstacle, () => {
            this.throttle = 0;
            this.car.body.setVelocity(0, 0);
            this.car.body.setAngularVelocity(0);
        });
    }

    update(time, delta) {
        const { left, right, up, down } = this.cursorKeys;

        if (up.isDown) {
            this.throttle += 0.5 * delta;
        } else if (down.isDown) {
            this.throttle -= 0.5 * delta;
        }

        this.throttle = Phaser.Math.Clamp(this.throttle, -64, 1024);

        if (left.isDown) {
            this.car.body.setAngularAcceleration(-360);
        } else if (right.isDown) {
            this.car.body.setAngularAcceleration(360);
        } else {
            this.car.body.setAngularAcceleration(0);
        }

        VelocityFromRotation(this.car.rotation, this.throttle, this.car.body.velocity);
        this.car.body.maxAngular = Phaser.Math.Clamp(90 * this.car.body.speed / 1024, 0, 90);

        const { scrollX, scrollY } = this.cameras.main;
        this.ground.setTilePosition(scrollX, scrollY);

        // rotate camera to face car
        this.cameras.main.setRotation(-this.car.rotation - Math.PI / 2);
        // zoom
        // this.cameras.main.setZoom(2);
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
    scene: Racer
};

const game = new Phaser.Game(config);
