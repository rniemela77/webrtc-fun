const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

const game = new Phaser.Game(config);
let player;
let moveLeft = false;
let moveRight = false;

function preload() {
  this.load.image('player', 'circle.png'); // Load your player ship image
}

function create() {
  // Create the player ship
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true); // Prevent ship from going off-screen

  // Input events for touch
  this.input.on('pointerdown', function (pointer) {
      if (pointer.x < game.config.width / 2) {
          moveLeft = true;
      } else {
          moveRight = true;
      }
  }, this);

  this.input.on('pointerup', function (pointer) {
      moveLeft = false;
      moveRight = false;
  }, this);
}

function update() {
  if (moveLeft) {
      player.setVelocityX(-200); // Move left
  } else if (moveRight) {
      player.setVelocityX(200); // Move right
  } else {
      player.setVelocityX(0); // Stop moving when no input
  }
}
