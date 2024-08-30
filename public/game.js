class Racer extends Phaser.Scene {
  constructor() {
    super({ key: "Racer" });
  }

  preload() {
    this.load.image("background", "path/to/background.png");
    this.load.image("spaceship", "path/to/spaceship.png");
  }

  create() {
    // Background setup
    this.background = this.add
      .tileSprite(
        0,
        0,
        this.game.config.width,
        this.game.config.height,
        "background"
      )
      .setTint(0x252325); // Adjust tint as needed
    this.background.setOrigin(0, 0);

    // Spaceship setup
    this.spaceship = this.add
      .sprite(
        this.game.config.width / 2,
        this.game.config.height - 50,
        "spaceship"
      )
      .setOrigin(0.5, 0.5);

    // Movement variables
    this.spaceshipSpeed = 0;
    this.maxSpeed = 5;
    this.acceleration = 0.1;
    this.deceleration = 0.05;

    // Set camera bounds
    this.cameras.main.setBounds(
      0,
      0,
      this.game.config.width,
      this.game.config.height
    );

    // Input handling
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create walls group
    this.walls = this.add.group({
      key: "wall",
      repeat: 10, // Adjust based on how many walls you want initially
      setXY: { x: 0, y: 0, stepX: 100 }, // Adjust stepX to space out walls
    });

    this.walls.children.iterate((child) => {
      child.setTint(0xc66666); // Adjust tint as needed
      child.setOrigin(0.5, 0);
      child.setY(Phaser.Math.Between(0, this.game.config.height));
    });
  }

  update() {
    // Move walls and check for off-screen
    this.walls.children.iterate((wall) => {
      wall.y += 5; // Adjust speed as needed
      if (wall.y > this.game.config.height + wall.displayHeight) {
        wall.y = -wall.displayHeight;
        wall.x = Phaser.Math.Between(0, this.game.config.width);
      }
    });

    // Move background
    this.background.tilePositionY -= 5; // Adjust speed as needed

    // Handle spaceship movement with acceleration
    if (this.cursors.left.isDown) {
      this.spaceshipSpeed = Math.max(
        this.spaceshipSpeed - this.acceleration,
        -this.maxSpeed
      );
    } else if (this.cursors.right.isDown) {
      this.spaceshipSpeed = Math.min(
        this.spaceshipSpeed + this.acceleration,
        this.maxSpeed
      );
    } else {
      this.spaceshipSpeed *= 1 - this.deceleration; // Decelerate when no input
    }

    this.spaceship.x += this.spaceshipSpeed;

    // Keep spaceship within screen bounds
    this.spaceship.x = Phaser.Math.Clamp(
      this.spaceship.x,
      50,
      this.game.config.width - 50
    );

    // Camera
    this.cameras.main.startFollow(this.spaceship, true, 0.01, 0.01);
    this.cameras.main.setZoom(1.3); // Adjust zoom as needed

    // rotate the camera based on the spaceship's speed
    this.cameras.main.setRotation(this.spaceshipSpeed * 0.012);
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
