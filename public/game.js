import Wave from "./wave.js";
import { updateSpaceshipPosition, createWakeEffect } from "./movement.js";

class Waver extends Phaser.Scene {
  constructor() {
    super({ key: "Racer" });
    this.waves = [];
  }

  preload() {
    this.load.image("background", "path/to/background.png");
    this.load.image("spaceship", "path/to/spaceship.png");
  }

  create() {
    this.createBackground();
    this.createSpaceship();
    this.initializeVariables();
    this.setupCamera();
    this.generateWaves();
    createWakeEffect(this, this.spaceship);
    // create rocks
    this.createObstacle();
    this.createGoal();
    // wait 1s
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.createGoal();
      },
      callbackScope: this,
    });
  }

  createGoal() {
    const goal = this.add.rectangle(
      Phaser.Math.Between(0, this.scale.width),
      -100,
      50,
      50,
      0x338833
    );

    // on scene update
    this.events.on("update", () => {
      goal.y += 2;
      if (goal.y > this.scale.height + goal.height) {
        goal.y = 0 - goal.height;
        goal.x = Phaser.Math.Between(0, this.scale.width);
      }

      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          goal.getBounds(),
          this.spaceship.getBounds()
        )
      ) {
        goal.y = 0 - goal.height;
      }
    });
  }

  createObstacle() {
    const obstacle = this.add.rectangle(
      this.scale.width / 3,
      -100,
      100,
      250,
      0x773333
    );

    // on scene update
    this.events.on("update", () => {
      obstacle.y += 5;
      if (obstacle.y > this.scale.height + obstacle.height) {
        obstacle.y = 0 - obstacle.height;
        obstacle.x = Phaser.Math.Between(0, this.scale.width);
      }
    });
  }

  update() {
    this.updateBackground();
    this.updateWaves();
    this.checkSpaceshipWaveInteraction();
    this.updateVelocityLine();
    updateSpaceshipPosition(this);
  }

  createSpaceship() {
    this.spaceship = this.add
      .sprite(this.scale.width / 2, this.scale.height * 0.8, "spaceship")
      .setOrigin(0.5, 0.5)
      .setScale(0.2)
      .setDepth(1);
  }

  updateVelocityLine() {
    // Start coordinates (spaceship's current position)
    const startX = this.spaceship.x;
    const startY = this.spaceship.y;

    // End coordinates based on velocity
    const endX = startX + this.spaceshipVelocity.x * 40; // Adjust the multiplier as needed
    const endY = startY; // Y position remains constant

    this.graphics?.clear();
    // Draw the line
    this.graphics = this.add.graphics();
    this.graphics.lineStyle(2, 0xff0000);
    this.graphics.beginPath();
    this.graphics.moveTo(startX, startY);
    this.graphics.lineTo(endX, endY);
    this.graphics.closePath();
    this.graphics.strokePath();
  }

  checkSpaceshipWaveInteraction() {
    const spaceship = this.spaceship;

    this.waves.forEach((wave) => {
      const distance = wave.getDistanceToPoint(spaceship.x, spaceship.y);
      if (distance < wave.detectionRadius) {
        const angle = Phaser.Math.Angle.Between(
          wave.waveStartX,
          wave.waveStartY,
          spaceship.x,
          spaceship.y
        );

        // Scale the force based on the distance
        const scaledForce =
          wave.repellingForce * (1 - distance / wave.detectionRadius);
        const forceX = Math.cos(angle) * scaledForce;

        // Apply the force gradually using the damping factor
        spaceship.x += forceX * (wave.damping * 5);
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

  createBackground() {
    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "background")
      .setTint(0x252325)
      .setOrigin(0, 0);
  }
  updateBackground() {
    this.background.tilePositionY -= this.backgroundSpeed;
  }

  initializeVariables() {
    this.spaceshipVelocity = new Phaser.Math.Vector2(0, 0);
    this.spaceshipSpeed = 0.1;
    this.maxSpeed = 2;
    this.spaceshipDrag = 0.95;

    this.backgroundSpeed = 3;
    this.cameraZoom = 1.5;
    this.cameraRotationFactor = 0.00012;
  }

  setupCamera() {
    const { width, height } = this.scale;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.spaceship, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.cameraZoom);
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
