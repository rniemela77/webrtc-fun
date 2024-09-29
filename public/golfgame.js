class Golf extends Phaser.Scene {
  constructor() {
    super({ key: "Golf" });
    this.waves = [];
  }

  preload() {}

  create() {
    this.force = 1.5;
    this.pointerDistance = 0;

    this.worldStartX = this.scale.width * 0.25;
    this.worldStartY = this.scale.height * 0.25;
    this.worldWidthX = this.scale.width * 0.5;
    this.worldWidthY = this.scale.height * 0.5;
    this.worldEndX = this.worldStartX + this.worldWidthX;
    this.worldEndY = this.worldStartY + this.worldWidthY;

    this.physics.world.setBounds(
      this.worldStartX,
      this.worldStartY,
      this.worldWidthX,
      this.worldWidthY
    );

    // create border around worldbounds
    this.add
      .rectangle(
        this.worldStartX,
        this.worldStartY,
        this.worldWidthX,
        this.worldWidthY,
        0x3784ff
      )
      .setOrigin(0);

    // this.ball = this.createBall();
    this.balls = [];
    this.balls.push(this.createBall());
    this.balls.push(this.createBall());
    this.balls.push(this.createBall());

    // when balls collide with each other, remove health
    this.physics.add.collider(this.balls, this.balls, (ball1) => {
      // the ball that is not the current ball
      if (ball1 !== this.ball) {
        ball1.health -= 100;
      }
    
      if (ball1.health <= 0) {
        ball1.destroy();
        this.balls = this.balls.filter((ball) => ball !== ball1);
      }
    });

    this.ball = this.balls[0];

    // for each ball in this.balls, show a white circle
    this.tinyBalls = [];
    this.balls.forEach((ball, index) => {
      const x = this.worldStartX + index * 15;
      const y = this.worldStartY - 20;
      // create a circle
      const tinyBall = this.add.circle(x, y, 4, 0xffffff).setOrigin(0);

      this.tinyBalls.push(tinyBall);
    });

    this.events.on("update", () => {
      // color the current ball
      this.tinyBalls.forEach((tinyBall, index) => {
        tinyBall.fillColor =
          this.balls[index] === this.ball ? 0xff0000 : 0xffffff;
      });
    });

    // on click
    this.input.on("pointerdown", this.handlePointerDown, this);

    // create obstacles
    // this.obstacles = this.physics.add.group();
    // this.createObstacles();

    // create graphics for drawing lines
    this.graphics = this.add.graphics();

    // on update event
    this.events.on("update", () => {
      // if the ball is moving
      if (this.ballIsMoving) {
        if (this.ball.body.speed < 10) {
          this.ballIsMoving = false;
          this.switchBall();
        }
      }
    });
  }

  createBall() {
    const ballSize = 20;
    const ball = this.add.circle(
      Phaser.Math.Between(this.worldStartX, this.worldEndX),
      Phaser.Math.Between(this.worldStartY, this.worldEndY),
      ballSize,
      0xffffff
    );

    // add physics
    this.physics.add.existing(ball);
    ball.body.setCircle(ballSize);
    ball.body.setBounce(1, 1);
    ball.body.setCollideWorldBounds(true);

    // add drag
    ball.body.setDrag(0.1);
    ball.body.setDamping(true); // Enable damping for drag to take effect

    ball.health = 100;

    return ball;
  }

  switchBall() {
    const index = this.balls.indexOf(this.ball);
    const nextIndex = (index + 1) % this.balls.length;
    this.ball = this.balls[nextIndex];

    // color current ball
    this.balls.forEach((ball) => {
      ball.fillColor = 0xffffff;
    });
    this.ball.fillColor = 0xff0000;
  }

  handlePointerDown(pointer) {
    this.ballIsMoving = true;
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

  createObstacle(x, y, size, color, isCircle, isImmovable) {
    let obstacle;

    if (isCircle) {
      obstacle = this.add.circle(x, y, size, color);
      this.physics.add.existing(obstacle);
      obstacle.body.setCircle(size);
    } else {
      obstacle = this.add.rectangle(x, y, size, size, color);
      this.physics.add.existing(obstacle);
    }

    this.obstacles.add(obstacle);
    obstacle.body.setCollideWorldBounds(true);

    if (isImmovable) {
      obstacle.body.setImmovable(true);
    } else {
      obstacle.body.setDrag(0.5);
      obstacle.body.setDamping(true);
    }
    obstacle.body.setBounce(1, 1);
    obstacle.body.mass = 1;

    this.physics.add.collider(this.ball, obstacle);
    this.physics.add.collider(this.obstacles, this.obstacles);
  }

  createObstacles() {
    const OBSTACLE_COLOR = 0x00ff00;
    const IMMUTABLE_COLOR = 0xff0000;

    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(this.worldStartX, this.worldEndX);
      const y = Phaser.Math.Between(this.worldStartY, this.worldEndY);
      const size = Math.random() > 0.5 ? 20 : 50;
      const isCircle = Math.random() > 0.5;
      const isImmovable = Math.random() > 0.5;
      const color = isImmovable ? IMMUTABLE_COLOR : OBSTACLE_COLOR;

      this.createObstacle(x, y, size, color, isCircle, isImmovable);
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
    this.graphics.clear();

    if (this.ballIsMoving) {
      return;
    }
    const LINE_COLOR = 0x5555ff;
    const EXPECTED_COLOR = 0xff0000;

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
