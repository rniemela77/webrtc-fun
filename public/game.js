class Example extends Phaser.Scene {
  preload() {
    this.load.image("circle", "circle.png"); // Replace with a square image if needed
    this.load.audio("soundEffect", "whoosh.wav");
  }

  create() {
    // Add a grid
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x8888ff, 0.3);
    for (let i = 0; i < window.innerWidth; i += 20) {
      graphics.moveTo(i, 0);
      graphics.lineTo(i, window.innerHeight);
    }
    for (let i = 0; i < window.innerHeight; i += 20) {
      graphics.moveTo(0, i);
      graphics.lineTo(window.innerWidth, i);
    }
    graphics.strokePath();

    this.vehicle = this.physics.add.image(100, 100, "circle");

    // Set up camera
    this.cameras.main.setZoom(1.5);
    this.cameras.main.startFollow(this.vehicle, true, 0.9, 0.9);
    
    // Set initial velocity and acceleration
    this.acceleration = 200; // Adjust this value for desired acceleration
    // max acceleration
    this.vehicle.setMaxVelocity(200); // Adjust this value for desired max speed
    this.vehicle.setAcceleration(0, 0);
    // this.vehicle.setDrag(0.95); // To simulate friction and reduce acceleration over time
    this.vehicle.setAngularVelocity(0);
    
    // Click on the right side of the screen to rotate right, left side to rotate left
    this.input.on("pointerdown", (pointer) => {
      if (pointer.x > window.innerWidth / 2) {
        this.vehicle.setAngularVelocity(100); // Adjust this value for desired steering speed
      } else {
        this.vehicle.setAngularVelocity(-100); // Adjust this value for desired steering speed
      }
    });
    
    // Stop steering when mouse is released
    this.input.on("pointerup", () => {
      this.vehicle.setAngularVelocity(0);
    });
  }

  update() {
    // Accelerate the vehicle in the direction it's facing
    const angle = this.vehicle.rotation;
    const x = Math.cos(angle) * this.acceleration;
    const y = Math.sin(angle) * this.acceleration;
    
    this.vehicle.setAcceleration(x, y);

    // Rotate the camera to match the vehicle's rotation
    this.cameras.main.rotation = -this.vehicle.rotation - Math.PI / 2;
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
      debug: false,
    },
  },
  scene: Example,
};

const game = new Phaser.Game(config);
