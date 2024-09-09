import Wave from './wave.js';

class Waver extends Phaser.Scene {
  constructor() {
    super({ key: "Racer" });
    this.waves = [];
  }

  preload() {
    this.loadImages();
  }

  create() {
    this.createBackground();
    this.createSpaceship();
    this.initializeVariables();
    this.setupCamera();
    this.setupInput();
    // this.createWave();
    this.time.addEvent({
      delay: 3000, // 3 seconds
      callback: this.generateWave,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    this.updateBackground();
    this.updateSpaceshipMovement();
    this.updateWaves();
    this.checkSpaceshipWaveInteraction(); // Check interaction and apply repelling force
  }

  checkSpaceshipWaveInteraction() {
    const spaceship = this.spaceship;
    const repellingForce = this.repellingForce;

    this.waves.forEach(wave => {
      const distance = wave.getDistanceToPoint(spaceship.x, spaceship.y);
      if (distance < this.waveDetectionRadius) {
        const angle = Phaser.Math.Angle.Between(
          wave.waveStartX,
          wave.waveStartY,
          spaceship.x,
          spaceship.y
        );
        spaceship.x += Math.cos(angle) * repellingForce;
        // spaceship.y -= Math.sin(angle) * repellingForce;
      }
    });
  }

  generateWave() {
    const startX = Phaser.Math.Between(0, this.scale.width);
    const endX = Phaser.Math.Between(0, this.scale.width);
    const wave = new Wave(this, startX, endX);
    this.waves.push(wave);
  }

  updateWaves() {
    this.waves.forEach(wave => wave.update());
  }


  loadImages() {
    this.load.image("background", "path/to/background.png");
    this.load.image("spaceship", "path/to/spaceship.png");
  }

  createBackground() {
    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "background")
      .setTint(0x252325)
      .setOrigin(0, 0);
  }

  createSpaceship() {
    this.spaceship = this.add
      .sprite(this.scale.width / 2, this.scale.height - 50, "spaceship")
      .setOrigin(0.5, 0.5)
      .setDepth(1);
  }

  initializeVariables() {
    this.spaceshipSpeed = 0;
    this.maxSpeed = 5;
    this.acceleration = 0.2;
    this.deceleration = 0.05;
    this.backgroundSpeed = 5;
    this.cameraZoom = 1.3;
    this.cameraRotationFactor = 0.012;
    this.spaceshipBoundsPadding = 50;
    this.waveDetectionRadius = 50; // Radius to detect wave interaction
    this.repellingForce = 5; // Force to repel the spaceship
  }

  setupCamera() {
    const { width, height } = this.scale;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.spaceship, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.cameraZoom);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  updateBackground() {
    this.background.tilePositionY -= this.backgroundSpeed;
  }

  updateSpaceshipMovement() {
    const cursors = this.cursors;

    if (cursors.left.isDown) {
      this.spaceshipSpeed = Math.max(
        this.spaceshipSpeed - this.acceleration,
        -this.maxSpeed
      );
      this.spaceship.angle -= 3; // Rotate left
    } else if (cursors.right.isDown) {
      this.spaceshipSpeed = Math.min(
        this.spaceshipSpeed + this.acceleration,
        this.maxSpeed
      );
      this.spaceship.angle += 3; // Rotate right
    } else {
      this.spaceshipSpeed *= 1 - this.deceleration;
    }

    // Apply smooth movement
    this.spaceship.x += this.spaceshipSpeed;
    this.spaceship.x = Phaser.Math.Clamp(
      this.spaceship.x,
      this.spaceshipBoundsPadding,
      this.scale.width - this.spaceshipBoundsPadding
    );

    // Smooth rotation
    this.spaceship.angle = Phaser.Math.Angle.Wrap(this.spaceship.angle);
  }

  updateCamera() {
    this.cameras.main.setRotation(
      this.spaceshipSpeed * this.cameraRotationFactor
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  parent: "phaser-example",
  physics: {
    default: "arcade",
    arcade: { debug: true },
  },
  scene: Waver,
};

const game = new Phaser.Game(config);