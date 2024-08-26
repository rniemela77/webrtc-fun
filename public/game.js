class Example extends Phaser.Scene {
  preload() {
    this.load.image("unit", "circle.png"); // Replace with a square image
  }

  create() {
    // create unit sprite
    this.p1unit = this.physics.add
      .sprite(width / 6, height / 3, "unit")
      // .setDrag(100)
      .setTint(0x7777ff)
      // .setCollideWorldBounds(true)
      // .setScale(0.5);
    this.p2unit = this.physics.add
      .sprite((width / 6) * 5, height / 3, "unit")
      // .setDrag(100)
      .setTint(0xff7777);
      // .setCollideWorldBounds(true)
      // .setScale(0.5);

    // create unit group
    this.units = this.physics.add.group();
    this.units.add(this.p1unit);
    this.units.add(this.p2unit);

    // when unit collides with eachother
    this.physics.add.collider(this.units, this.units);
    



    // full width rectangle
    this.rect = this.add.rectangle(
      width / 2,
      height,
      width,
      height / 2,
      0x222222
    );
    this.physics.add.existing(this.rect, true); // Enable physics for the rectangle

    // gravity
    this.physics.world.gravity.y = 800;

    // Add collision detection
    this.physics.add.collider(this.p1unit, this.rect);
    this.physics.add.collider(this.p2unit, this.rect);

    this.handleActions();

    this.makeAI(this.p2unit, this.p1unit);
  }

  makeAI(unit, attackUnit) {
    this.time.addEvent({
      delay: 300,
      callback: function () {
        if (unit.body.touching.down) {
          this.jump(unit);
        } else if (Math.random() < 0.5) {
          this.attack(unit, attackUnit);
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  handleActions() {

    this.input.keyboard.on(
      "keydown-SPACE",
      function (event) {
        if (!this.p1unit.body.touching.down) {
          this.attack(this.p1unit, this.p2unit);
        } else {
          this.jump(this.p1unit);
        }
      },
      this
    );

    this.input.on(
      "pointerdown",
      function (pointer) {
        if (!this.p2unit.body.touching.down) {
          this.attack(this.p2unit, this.p1unit);
        } else {
          this.jump(this.p2unit);
        }
      },
      this
    );
  }

  attack(unit, target) {
    const direction = target.x - unit.x;
    const velocity = 250;

    // disable gravity
    unit.setGravityY(0);
    // move the unit towards the target
    unit.setVelocityX(direction > 0 ? velocity : -velocity);

    // after 0.5 seconds, stop the unit
    this.time.addEvent({
      delay: 500,
      callback: function () {
        unit.setVelocityX(0);
        unit.setGravityY(800);
      },
      callbackScope: this,
      loop: false,
    });
  }

  handleJump() {
    this.cursors = this.input.keyboard.createCursorKeys();

    // on pressing space, jump
    this.input.keyboard.on(
      "keydown-SPACE",
      function (event) {
        this.jump(this.p1unit);
      },
      this
    );

    // mouse
    this.input.on(
      "pointerdown",
      function (pointer) {
        this.jump(this.p2unit);
      },
      this
    );
  }

  jump(unit) {
    const height = 600;
    unit.setVelocityY(-height);
  }

  update() {}
}

let width = window.innerWidth;
let height = window.innerHeight;

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
