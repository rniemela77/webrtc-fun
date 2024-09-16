import Wave from "./wave.js";
class Waver extends Phaser.Scene {
  constructor() {
    super({ key: "Racer" });
    this.waves = [];
  }

  preload() {
    this.loadImages();
    this.load.plugin(
      "rexvirtualjoystickplugin",
      "../node_modules/phaser3-rex-plugins/plugins/virtualjoystick.js",
      true
    );
  }

  create() {
    this.createBackground();
    this.createSpaceship();
    this.initializeVariables();
    this.setupCamera();
    this.input.on("pointerdown", this.createVirtualJoystick, this);
    this.input.on("pointerup", this.hideVirtualJoystick, this);
    this.generateWaves();
  }

  update() {
    this.updateBackground();
    this.updateWaves();
    this.checkSpaceshipWaveInteraction();
    this.updateCamera();
    this.updateVirtualJoystickMovement();
    this.checkSpaceshipWaveInteraction();
    this.updateSpaceshipPosition();
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

  createVirtualJoystick(pointer) {
    // If joystick exists, update its position
    if (this.joystick) {
      this.joystick.setPosition(pointer.x, pointer.y);
      this.showVirtualJoystick();
    } else {
      // Create joystick
      this.joystick = this.plugins.get("rexvirtualjoystickplugin").add(this, {
        // where on the screen it is seen
        x: pointer.x,
        y: pointer.y,
        radius: 50,
        deadzone: 20,
        base: this.add.circle(0, 0, 50, 0x888888),
        thumb: this.add.circle(0, 0, 20, 0xcccccc),
        dir: "8dir", // 'up&down', 'left&right', '4dir', '8dir'
        forceMin: 5, // Minimum force of stick when dragging. 0 to 1
        enable: true, // Enable the joystick
      });
    }
  }

  showVirtualJoystick() {
    if (this.joystick) {
      this.joystick.base.setAlpha(1); // Optional: make it visible if needed
      this.joystick.thumb.setAlpha(1); // Optional: make it visible if needed
    }
  }

  hideVirtualJoystick() {
    if (this.joystick) {
      this.joystick.base.setAlpha(0); // Optional: make it invisible if needed
      this.joystick.thumb.setAlpha(0); // Optional: make it invisible if needed
    }
  }

  updateVirtualJoystickMovement() {
    if (!this.joystick || !this.joystick.force) return;

    const sensitivity = 0.01;
    const velocity = new Phaser.Math.Vector2(
      this.joystick.forceX,
      this.joystick.forceY
    );

    if (velocity.length() > 0) {
      velocity
        .normalize()
        .scale(this.joystick.force * this.maxSpeed * sensitivity);
      this.spaceshipVelocity.lerp(velocity, 0.1); // Smooth transition
    } else {
      this.spaceshipVelocity.scale(0.9); // Gradual stop
    }

    const maxVelocity = 100;
    this.spaceshipVelocity.x = Phaser.Math.Clamp(
      this.spaceshipVelocity.x,
      -maxVelocity,
      maxVelocity
    );
    this.spaceshipVelocity.y = 0; // Y velocity is always 0
  }

  updateCamera() {
    this.cameras.main.setRotation(
      this.spaceshipSpeed * this.cameraRotationFactor
    );
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
    this.acceleration = 0.1; // Reduced acceleration for smoother speed up
    this.deceleration = 0.02; // Reduced deceleration for smoother slow down
    this.backgroundSpeed = 3;
    this.cameraZoom = 1.2;
    this.cameraRotationFactor = 0.012;
    this.spaceshipBoundsPadding = 50;
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

  updateSpaceshipPosition() {
    this.spaceship.x += (this.spaceshipVelocity.x * this.game.loop.delta) / 100;

    this.spaceship.x = Phaser.Math.Clamp(
      this.spaceship.x,
      this.spaceshipBoundsPadding,
      this.scale.width - this.spaceshipBoundsPadding
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
