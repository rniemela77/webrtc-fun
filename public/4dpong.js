class Pong extends Phaser.Scene {
  constructor() {
    super({ key: "Golf" });
    this.waves = [];
  }

  preload() {}

  create() {
    this.playerPaddle = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 50,
      this.scale.width / 2,
      this.scale.width / 2,
      0xffffff,
      0.1
    );

    this.ball = this.add.circle(
      this.scale.width / 2,
      this.scale.height / 2,
      10,
      0xffffff
    );

    this.innerGuide = this.add.rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        50,
        50,
        0xffffff,
        0.01
    )
    this.innerGuide.setStrokeStyle(1, 0xff5555);

    this.outerGuide = this.add.rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        100 * 7,
        100 * 7,
        0xffffff,
        0.01
    )
    this.outerGuide.setStrokeStyle(1, 0xff5555);

    this.ballDistanceGuide = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      50,
      50,
      0xffffff,
      0.01
    );

    // give guide border
    this.ballDistanceGuide.setStrokeStyle(1, 0xff5555);

    this.physics.add.existing(this.ball);

    this.ball.velocity = new Phaser.Math.Vector2(0.5, -0.5);

    this.ballDistance = 5;
    this.ballDirection = 1;

    // every 0.2s
    this.time.addEvent({
      delay: 20,
      callback: () => {
        this.ballDistance += 0.1 * this.ballDirection;

        if (this.ballDistance > 10) {
          this.ballDirection = -1;

          this.checkBallCollision();
        } else if (this.ballDistance < 2) {
          this.ballDirection = 1;
        }
      },
      callbackScope: this,
      loop: true,
    });

    this.input.on("pointermove", (pointer) => {
      this.playerPaddle.x = pointer.x;
      this.playerPaddle.y = pointer.y;
    });
  }

  checkBallCollision() {
    // find angle and distance of ball from center of paddle
    const angle = Phaser.Math.Angle.Between(
      this.playerPaddle.x,
      this.playerPaddle.y,
      this.ball.x,
      this.ball.y
    );
    const distance = Phaser.Math.Distance.Between(
      this.playerPaddle.x,
      this.playerPaddle.y,
      this.ball.x,
      this.ball.y
    );

    // then adjust the ball's velocity based on the angle and distance
    this.ball.velocity.x = Math.cos(angle) * distance * 0.01;
    this.ball.velocity.y = Math.sin(angle) * distance * 0.01;
  }

  update() {
    // move the ball
    // this.ball.x += this.ball.velocity.x;
    // this.ball.y += this.ball.velocity.y;

    const distanceRatio = this.ballDistance / 5;
    const exponent = 5;
    const cubicBezierScale = Math.pow(distanceRatio, exponent);
    this.ball.scale = cubicBezierScale;
    this.ballDistanceGuide.scale = cubicBezierScale;



    // this.ball.x += this.ball.velocity.x;
    // this.ball.y += this.ball.velocity.y;

    // if (this.ball.x < 0 || this.ball.x > this.scale.width) {
    //   this.ball.velocity.x *= -1;
    // }
    // if (this.ball.y < 0 || this.ball.y > this.scale.height) {
    //   this.ball.velocity.y *= -1;
    // }
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
    // arcade: { debug: true },
  },
  scene: Pong,
};

const game = new Phaser.Game(config);
