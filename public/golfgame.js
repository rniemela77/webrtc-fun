class Golf extends Phaser.Scene {
  constructor() {
    super({ key: "Golf" });
    this.waves = [];
  }

  preload() {}

  create() {
    // create a white circle
    this.ball = this.add.circle(100, 100, 10, 0xffffff);

    // add physics
    this.physics.add.existing(this.ball);
    this.ball.body.setCircle(10);
    this.ball.body.setBounce(1, 1);
    this.ball.body.setCollideWorldBounds(true);

    // add drag
    this.ball.body.setDrag(0.7);
    this.ball.body.setDamping(true); // Enable damping for drag to take effect

    this.ball.x = this.scale.width / 2;
    this.ball.y = this.scale.height / 2;

    this.input.on("pointermove", (pointer) => {
      const pointerDistance = Phaser.Math.Distance.Between(
        this.ball.x,
        this.ball.y,
        pointer.x,
        pointer.y
      );
      // pointer to ball line
      this.graphics?.clear();
      this.graphics = this.add.graphics();
      this.graphics.lineStyle(2, 0x5555ff, 0.5);
      this.graphics.beginPath();
      this.graphics.moveTo(this.ball.x, this.ball.y);
      this.graphics.lineTo(pointer.x, pointer.y);
      this.graphics.closePath();
      this.graphics.strokePath();

      // ball to expected location line
      const angle = Phaser.Math.Angle.Between(
        this.ball.x,
        this.ball.y,
        pointer.x,
        pointer.y
      );
      this.graphics.lineStyle(2, 0xff0000, 0.2);
      this.graphics.beginPath();
      this.graphics.moveTo(this.ball.x, this.ball.y);
      this.graphics.lineTo(
        this.ball.x + (Math.cos(angle) * -pointerDistance) / 2,
        this.ball.y + (Math.sin(angle) * -pointerDistance) / 2
      );
      this.graphics.closePath();
      this.graphics.strokePath();

      // if obstacle overlaps with line, change color
      // todo
    });

    // on click
    this.input.on("pointerdown", (pointer) => {
      const angle = Phaser.Math.Angle.Between(
        this.ball.x,
        this.ball.y,
        pointer.x,
        pointer.y
      );

      const oppositeAngle = angle + Math.PI; // Calculate the opposite angle

      const oppositeX = this.ball.x + Math.cos(oppositeAngle) * 200; // Calculate the x coordinate in the opposite direction
      const oppositeY = this.ball.y + Math.sin(oppositeAngle) * 200; // Calculate the y coordinate in the opposite direction

      this.physics.moveTo(this.ball, oppositeX, oppositeY, 200); // Move the ball in the opposite direction
    });

    // create obstacles
    this.obstacles = this.physics.add.group();
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);

      const size = Math.random() > 0.5 ? 20 : 50;

      let obstacle;

      if (Math.random() > 0.5) {
        obstacle = this.add.circle(x, y, size, 0x00ff00);
        this.physics.add.existing(obstacle);
        obstacle.body.setCircle(size);
      } else {
        obstacle = this.add.rectangle(x, y, size, size, 0x00ff00);
        this.physics.add.existing(obstacle);
      }

      this.obstacles.add(obstacle);
      obstacle.body.setCollideWorldBounds(true);

      if (Math.random() > 0.5) {
        obstacle.body.setImmovable(true);
        obstacle.fillColor = 0xff0000;
        obstacle.body.mass = 100;
      } else {
        obstacle.body.setBounce(1, 1);
        obstacle.body.setDrag(0.5);
        obstacle.body.setDamping(true);
      }
      
      this.physics.add.collider(this.ball, obstacle);
      this.physics.add.collider(this.obstacles, this.obstacles);
    }
  }

  update() {}
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
  scene: Golf,
};

const game = new Phaser.Game(config);
