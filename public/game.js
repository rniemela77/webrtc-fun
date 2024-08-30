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
    this.background = this.add.tileSprite(
      0,
      0,
      this.game.config.width,
      this.game.config.height,
      "background"
    ).setTint(0x252325); // Adjust tint as needed
    this.background.setOrigin(0, 0);

    // Spaceship setup
    this.spaceship = this.add.sprite(
      this.game.config.width / 2,
      this.game.config.height - 50,
      "spaceship"
    )

    this.spaceship.setOrigin(0.5, 0.5);

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

    // Handle spaceship movement
    if (this.cursors.left.isDown) {
      this.spaceship.x -= 5; // Adjust speed as needed
    } else if (this.cursors.right.isDown) {
      this.spaceship.x += 5; // Adjust speed as needed
    }

    // Keep spaceship within screen bounds
    this.spaceship.x = Phaser.Math.Clamp(
      this.spaceship.x,
      50,
      this.game.config.width - 50
    );

    // Rotate camera to match spaceship direction
    let angle = Phaser.Math.Angle.Between(
      this.spaceship.x,
      this.spaceship.y,
      this.spaceship.x +
        (this.cursors.right.isDown ? 1 : this.cursors.left.isDown ? -1 : 0),
      this.spaceship.y
    );
    // this.cameras.main.setRotation(angle - Math.PI / 2);
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