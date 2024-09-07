class Racer extends Phaser.Scene {
  constructor() {
    super({ key: "Racer" });
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
    this.createWave();
  }

  update() {
    this.updateBackground();
    this.updateSpaceshipMovement();
    this.updateWaves();
    this.checkSpaceshipWaveInteraction(); // Check interaction and apply repelling force
  }

  createWave() {
    // Create a wave (a line) that moves from the bottom to the top of the screen
    this.wave = this.add.graphics();
    this.wave.lineStyle(2, 0xffffff, 1);
    this.wave.beginPath();
    this.wave.moveTo(0, this.scale.height);
    this.wave.lineTo(this.scale.width, 0);
    this.wave.closePath();
    this.wave.strokePath();

    // Store the wave's start and end positions
    this.waveStartX = 0;
    this.waveStartY = this.scale.height;
    this.waveEndX = this.scale.width;
    this.waveEndY = 0;
  }

  updateWaves() {
    // Move the wave down 2px
    this.wave.y += 2;

    // Update wave positions
    this.waveStartY += 2;
    this.waveEndY += 2;
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
    this.repellingForce = 2; // Force to repel the spaceship
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

  checkSpaceshipWaveInteraction() {
    const spaceshipX = this.spaceship.x;
    const spaceshipY = this.spaceship.y;

    // Wave's position and dimensions
    const waveStartX = this.waveStartX;
    const waveStartY = this.waveStartY;
    const waveEndX = this.waveEndX;
    const waveEndY = this.waveEndY;

    // Calculate distance to the closest point on the wave
    const { closestPoint, distance } = this.calculateClosestPointOnLine(
      waveStartX, waveStartY, waveEndX, waveEndY,
      spaceshipX, spaceshipY
    );

    // Check if the distance is within the interaction radius
    if (distance < this.waveDetectionRadius) {
      this.spaceship.setTint(0xcccccc); // Turn red

      // Calculate direction vector from the spaceship to the closest point
      const directionX = spaceshipX - closestPoint.x;
      const directionY = spaceshipY - closestPoint.y;
      const magnitude = Phaser.Math.Distance.Between(0, 0, directionX, directionY);
      
      // Normalize the direction vector
      const normalizedX = directionX / magnitude;
      const normalizedY = directionY / magnitude;

      // Apply repelling force
      this.spaceship.x += this.repellingForce * normalizedX;
      // this.spaceship.y += this.repellingForce * normalizedY;
    } else {
      this.spaceship.clearTint(); // Reset color
    }
  }

  calculateClosestPointOnLine(x1, y1, x2, y2, px, py) {
    const lineLength = Phaser.Math.Distance.Between(x1, y1, x2, y2);
    if (lineLength === 0) return { closestPoint: { x: x1, y: y1 }, distance: Phaser.Math.Distance.Between(px, py, x1, y1) };

    const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLength * lineLength);
    const closestX = x1 + t * (x2 - x1);
    const closestY = y1 + t * (y2 - y1);

    return {
      closestPoint: { x: closestX, y: closestY },
      distance: Phaser.Math.Distance.Between(px, py, closestX, closestY)
    };
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
  scene: Racer,
};

const game = new Phaser.Game(config);
