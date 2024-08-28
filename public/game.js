class Example extends Phaser.Scene {
  preload() {
    this.load.image("unit", "circle.png"); // Replace with a square image  this.load.audio('soundEffect', 'path/to/sound/file.mp3');
    this.load.audio("soundEffect", "whoosh.wav");
  }

  create() {
    this.unit = this.physics.add
      .image(width / 2 - 250, height / 2 + 50, "circle")
      .setOrigin(0.5)
      .setDepth(1)
      // .setScale(0.75);

    // this.destination = this.add
    //   .image(width / 2 - 100, height / 2, "circle")
    //   .setOrigin(0.5)
    //   .setDepth(1)
    //   .setScale(0.1);

    // zoom camera on unit
    this.cameras.main.startFollow(this.unit);
    this.cameras.main.setZoom(0.5);

    // this.physics.add.existing(this.unit);

    this.input.on("pointerdown", (pointer) => {
      // if already moving, stop
      if (this.tweens.isTweening(this.unit)) {
        this.tweens.killTweensOf(this.unit);
      }
      // determine if its to the left of the unit or the right
      const worldPoint = this.input.activePointer.positionToCamera(
        this.cameras.main
      );
      let dir = worldPoint.x < this.unit.x ? -1 : 1;

      // lurch the player in that direction (x axis)
      this.tweens.add({
        targets: this.unit,
        x: this.unit.x + dir * 100,
        duration: 1000,
        ease: "Power2",
      });
    });

    // on update
    this.events.on("update", () => {
      return;
      // if unit is somewhat near the destination
      if (
        Phaser.Math.Distance.Between(
          this.unit.x,
          this.unit.y,
          this.destination.x,
          this.destination.y
        ) < 10
      ) {
        this.unit.setVelocity(0, 0);
        return;
      }
      // this.unit.x += 1;
      // move unit towards destination
      const angle = Phaser.Math.Angle.Between(
        this.unit.x,
        this.unit.y,
        this.destination.x,
        this.destination.y
      );

      this.unit.setVelocity(Math.cos(angle) * 100, Math.sin(angle) * 100);

      // rotate the unit
      this.unit.rotation = angle;
    });

    this.entrance = this.add
      .rectangle(width / 2 - 300, height / 2 - 100, 300, 300, 0x9999ff)
      .setOrigin(0);
    this.grid = [
      ["", "", ""],
      ["x", "", ""],
      ["", "x", ""],
      ["", "", "x"],
      ["x", "x", "x"],
    ];

    // grid cells group
    this.cells = this.add.group();

    // show the grid cells
    for (let i = 0; i < this.grid[0].length; i++) {
      // create a square
      this.cells.add(
        this.add
          .rectangle(width / 2 + i * 101, height / 2, 100, 100, 0x6666ff)
          .setOrigin(0)
      );
    }
    let currentStep = 0;

    // every 0.5s
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        // get the current row
        const row = this.grid[currentStep];

        const cells = this.cells.getChildren();

        // show a red square if its an x
        for (let i = 0; i < row.length; i++) {
          if (row[i] === "x") {
            cells[i].fillColor = 0xff6666;
            // after 0.3s, return back to normal color
            this.time.addEvent({
              delay: 300,
              callback: () => {
                cells[i].fillColor = 0x6666ff;
              },
            });


            // this.sound.play('soundEffect')
            // tweak the sound effect
            this.sound.play("soundEffect", {
              rate: 1 * Math.pow(1.0594630943592953, i),
              detune: 100,
              seek: 0,
            });
          } else {
            cells[i].fillColor = 0x6666ff;
          }
        }

        currentStep++;
        if (currentStep >= this.grid.length) {
          currentStep = 0;
        }
      },
    });
  }
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
