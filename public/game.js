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
    this.createObstacles();
    this.setupCamera();
    this.setupInput();
  }

  update() {
    this.updateObstacles();
    this.updateBackground();
    this.updateSpaceshipMovement();
    this.updateCamera();
  }

  loadImages() {
    this.load.image("background", "path/to/background.png");
    this.load.image("spaceship", "path/to/spaceship.png");
    this.load.image("obstacle", "path/to/obstacle.png");
  }

  createBackground() {
    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "background")
      .setTint(0x252325)
      .setOrigin(0, 0);
  }

  createSpaceship() {
    const spaceshipStartX = this.scale.width / 2;
    const spaceshipStartY = this.scale.height - 50;

    this.spaceship = this.add
      .sprite(spaceshipStartX, spaceshipStartY, "spaceship")
      .setOrigin(0.5, 0.5)
      .setDepth(1);
  }

  initializeVariables() {
    this.spaceshipSpeed = 0;
    this.maxSpeed = 5;
    this.acceleration = 0.2;
    this.deceleration = 0.05;
    this.obstacleSpeed = 5;
    this.backgroundSpeed = 5;
    this.cameraZoom = 1.3;
    this.cameraRotationFactor = 0.012;
    this.spaceshipBoundsPadding = 50;
  }

  createObstacles() {
    this.obstacles = this.add.group({
      key: "obstacle",
      repeat: 10,
      setXY: { x: 0, y: 0, stepX: 100 },
    });

    this.obstacles.children.iterate((obstacle) => {
      obstacle.setTint(0xc66666)
        .setOrigin(0.5, 0)
        .setY(Phaser.Math.Between(0, this.scale.height));
    });
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.startFollow(this.spaceship, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.cameraZoom);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  updateObstacles() {
    this.obstacles.children.iterate((obstacle) => {
      obstacle.y += this.obstacleSpeed;
      if (obstacle.y > this.scale.height + obstacle.displayHeight) {
        obstacle.y = -obstacle.displayHeight;
        obstacle.x = Phaser.Math.Between(0, this.scale.width);
      }
    });
  }

  updateBackground() {
    this.background.tilePositionY -= this.backgroundSpeed;
  }

  updateSpaceshipMovement() {
    if (this.cursors.left.isDown) {
      this.spaceshipSpeed = Math.max(this.spaceshipSpeed - this.acceleration, -this.maxSpeed);
    } else if (this.cursors.right.isDown) {
      this.spaceshipSpeed = Math.min(this.spaceshipSpeed + this.acceleration, this.maxSpeed);
    } else {
      this.spaceshipSpeed *= 1 - this.deceleration;
    }

    this.spaceship.x += this.spaceshipSpeed;
    this.spaceship.x = Phaser.Math.Clamp(
      this.spaceship.x,
      this.spaceshipBoundsPadding,
      this.scale.width - this.spaceshipBoundsPadding
    );
  }

  updateCamera() {
    this.cameras.main.setRotation(this.spaceshipSpeed * this.cameraRotationFactor);
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
    arcade: {
      debug: true,
    },
  },
  scene: Racer,
};

const game = new Phaser.Game(config);
