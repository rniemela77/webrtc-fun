import Wave from "./wave.js";
import { updateSpaceshipPosition } from "./movement.js";

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
    this.generateWaves();
    this.createVirtualJoystick();
  }

  update() {
    this.updateBackground();
    this.updateWaves();
    this.checkSpaceshipWaveInteraction();
    updateSpaceshipPosition(
      this.spaceship,
      this.spaceshipVelocity,
      this.game.loop.delta,
      this.spaceshipBoundsPadding,
      this.scale.width
    );
    this.drawVelocityLine();
  }

  drawVelocityLine() {
    this.graphics?.clear();

    if (!this.pointer.isDown) {
      return;
    }

    // Start coordinates (spaceship's current position)
    const startX = this.spaceship.x;
    const startY = this.spaceship.y;

    // End coordinates based on velocity
    const endX = startX + this.spaceshipVelocity.x * 10; // Adjust the multiplier as needed
    const endY = startY; // Y position remains constant

    // Draw the line
    this.graphics = this.add.graphics();
    this.graphics.lineStyle(2, 0xff0000);
    this.graphics.beginPath();
    this.graphics.moveTo(startX, startY);
    this.graphics.lineTo(endX, endY);
    this.graphics.closePath();
    this.graphics.strokePath();
  }

  createVirtualJoystick() {
    // when user clicks on the screen
    this.input.on("pointerdown", (pointer) => {
      // Convert the pointer position from screen space to world space
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

      // Create a square
      this.joystick = this.add.rectangle(
        worldPoint.x,
        worldPoint.y,
        10,
        10,
        0xff0000
      );
    });

    // when user moves the pointer
    this.input.on("pointermove", (pointer) => {
      if (!this.joystick) return;
      if (!pointer.isDown) return;
    });

    // when user releases the pointer
    this.input.on("pointerup", (pointer) => {
      if (!this.joystick) return;
      if (this.accelerationLine) this.accelerationLine.clear();

      this.joystick.destroy();
      this.joystick = null;
    });

    // on scene update
    this.events.on("update", () => {
      if (!this.joystick) return;
      if (!this.pointer.isDown) return;
      if (this.pointer.isDown) {
        if (this.accelerationLine) this.accelerationLine.clear();
  
        const worldPoint = this.cameras.main.getWorldPoint(this.pointer.x, this.pointer.y);
  
        // create acceleration line from joystick to pointer
        this.accelerationLine = this.add.graphics();
        this.accelerationLine.lineStyle(2, 0xff0000);
        this.accelerationLine.beginPath();
        this.accelerationLine.moveTo(this.joystick.x, this.joystick.y);
        this.accelerationLine.lineTo(worldPoint.x, worldPoint.y);
        this.accelerationLine.closePath();
        this.accelerationLine.strokePath();
      }

      // find width of accelerationLine
      const width = this.accelerationLine?.geom?.line?.width;

      
    });
  }

  checkSpaceshipWaveInteraction() {
    const spaceship = this.spaceship;
    const repellingForce = this.repellingForce;
    const damping = this.repellingDamping;

    this.waves.forEach((wave) => {
      const distance = wave.getDistanceToPoint(spaceship.x, spaceship.y);
      if (distance < this.waveDetectionRadius) {
        const angle = Phaser.Math.Angle.Between(
          wave.waveStartX,
          wave.waveStartY,
          spaceship.x,
          spaceship.y
        );

        // Scale the force based on the distance
        const scaledForce =
          repellingForce * (1 - distance / this.waveDetectionRadius);
        const forceX = Math.cos(angle) * scaledForce;
        const forceY = 0; // No force applied on Y axis

        // Apply the force gradually using the damping factor
        spaceship.x += forceX * (damping * 5);
      }
    });
  }

  generateWaves() {
    this.time.addEvent({
      delay: 3000, // 3 seconds
      callback: () => {
        const startX = Phaser.Math.Between(0, this.scale.width);
        const endX = Phaser.Math.Between(0, this.scale.width);
        const wave = new Wave(this, startX, endX);
        this.waves.push(wave);
      },
      callbackScope: this,
      loop: true,
    });
  }

  updateWaves() {
    this.waves.forEach((wave) => wave.update());
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
    this.pointer = this.input.activePointer;
    this.spaceshipVelocity = new Phaser.Math.Vector2(0, 0);
    this.spaceshipSpeed = 0;
    this.maxSpeed = 2;
    this.backgroundSpeed = 3;
    this.cameraZoom = 1.5;
    this.cameraRotationFactor = 0.012;
    this.waveDetectionRadius = 150; // Radius to detect wave interaction
    this.repellingForce = 3; // Force to repel the spaceship
    this.repellingDamping = 0.5; // Damping factor for smooth repelling
  }

  setupCamera() {
    const { width, height } = this.scale;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.spaceship, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.cameraZoom);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.on("pointermove", (pointer) => {
      this.pointer = pointer;
    });
  }

  updateBackground() {
    this.background.tilePositionY -= this.backgroundSpeed;
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
