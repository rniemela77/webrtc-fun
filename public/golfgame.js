class Golf extends Phaser.Scene {
  constructor() {
    super({ key: "Golf" });
    this.waves = [];
  }

  preload() {}

  create() {
    this.force = 1.5;
    this.pointerDistance = 0;

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

    // on click
    this.input.on("pointerdown", this.handlePointerDown, this);

    // create obstacles
    this.obstacles = this.physics.add.group();
    this.createObstacles();

    // create graphics for drawing lines
    this.graphics = this.add.graphics();
  }

  handlePointerDown(pointer) {
    const angle = Phaser.Math.Angle.Between(
      this.ball.x,
      this.ball.y,
      pointer.x,
      pointer.y
    );

    const force = this.force * this.pointerDistance;

    const oppositeAngle = angle + Math.PI; // Calculate the opposite angle

    const oppositeX = this.ball.x + Math.cos(oppositeAngle) * force;
    const oppositeY = this.ball.y + Math.sin(oppositeAngle) * force;

    this.physics.moveTo(this.ball, oppositeX, oppositeY, force); // Move the ball in the opposite direction
  }

  createObstacles() {
    const OBSTACLE_COLOR = 0x00ff00;
    const IMMUTABLE_COLOR = 0xff0000;

    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);

      const size = Math.random() > 0.5 ? 20 : 50;

      let obstacle;

      if (Math.random() > 0.5) {
        obstacle = this.add.circle(x, y, size, OBSTACLE_COLOR);
        this.physics.add.existing(obstacle);
        obstacle.body.setCircle(size);
      } else {
        obstacle = this.add.rectangle(x, y, size, size, OBSTACLE_COLOR);
        this.physics.add.existing(obstacle);
      }

      this.obstacles.add(obstacle);
      obstacle.body.setCollideWorldBounds(true);

      if (Math.random() > 0.5) {
        obstacle.body.setImmovable(true);
        obstacle.fillColor = IMMUTABLE_COLOR;
      } else {
        obstacle.body.setDrag(0.5);
        obstacle.body.setDamping(true);
      }
      obstacle.body.setBounce(1, 1);
      obstacle.body.mass = 1;

      this.physics.add.collider(this.ball, obstacle);
      this.physics.add.collider(this.obstacles, this.obstacles);
    }
  }

  update() {
    const pointer = this.input.activePointer;
    this.pointerDistance = Phaser.Math.Distance.Between(
      this.ball.x,
      this.ball.y,
      pointer.x,
      pointer.y
    );

    this.drawLines(pointer);
  }

  drawLines(pointer) {
    const LINE_COLOR = 0x5555ff;
    const EXPECTED_COLOR = 0xff0000;

    this.graphics.clear();

    // pointer to ball line
    this.graphics.lineStyle(2, LINE_COLOR, 0.1);
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
    this.graphics.lineStyle(2, EXPECTED_COLOR, 0.2);
    this.graphics.beginPath();
    this.graphics.moveTo(this.ball.x, this.ball.y);
    this.graphics.lineTo(
      this.ball.x + Math.cos(angle) * -this.pointerDistance,
      this.ball.y + Math.sin(angle) * -this.pointerDistance
    );
    this.graphics.closePath();
    this.graphics.strokePath();
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
  scene: Golf,
};

const game = new Phaser.Game(config);
