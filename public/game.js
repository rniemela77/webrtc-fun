const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);
let player;

function preload() {
  this.load.image("player", "circle.png"); // Load your player ship image
}

function create() {
  // Create the player ship
  player = this.physics.add.sprite(400, 500, "player");
  player.setCollideWorldBounds(true); // Prevent ship from going off-screen

  // if pointer is down
  this.input.on("pointerdown", (pointer) => {
    this.pointerDown = true;
  });

  // if pointer is up
  this.input.on("pointerup", (pointer) => {
    this.pointerDown = false;
  });
}

function update() {
  // if pointer is down and player is left or right
  if (this.pointerDown && player) {
    if (this.input.activePointer.x < player.x) {
      player.setVelocityX(-160);
    } else if (this.input.activePointer.x > player.x) {
      player.setVelocityX(160);
    }
  } else {
    player.setVelocityX(0);
  }
}
