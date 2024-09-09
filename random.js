class Waver extends Phaser.Scene {
    constructor() {
      super({ key: "Racer" });
      this.waves = [];
    }
  
    preload() {}
  
    create() {
      this.player = this.physics.add.sprite(
        this.scale.width / 2,
        this.scale.height * 0.8,
        "character"
      );
      // player physics in bonds
      this.player.setCollideWorldBounds(true);
  
      this.createObstacle();
    }
  
    createObstacle() {
      const obstacle = this.add.rectangle(
        this.scale.width / 3,
        -100,
        150,
        250,
        0x00ff00
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
      const playerAngle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        this.input.x,
        this.input.y
      );
  
      this.player.setVelocityX(Math.cos(playerAngle) * 200);
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
  