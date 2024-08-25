class Example extends Phaser.Scene {
  preload() {
    this.load.image("p1unit", "circle.png");
  }

  create() {
    this.p1unit = this.physics.add.sprite(width / 2, height / 2, "p1unit");
    this.p1unit.setScale(0.5);
    this.p1unit.body.setBounce(0.2, 0.2);
    this.p1unit.body.setMaxVelocity(400, 400);
    this.p1unit.body.setGravity(0, 200);

    // this.add.particles(400, 200, "star", {
    //   speed: 100,
    //   lifespan: 3000,
    //   gravityY: 200,
    // });

    this.generateLand();
  }

  update() {
    this.p1unit.setAcceleration(0, 0);

    // if mouse is down
    if (this.input.activePointer.isDown) {
      this.p1unit.setAccelerationY(-1000);
    }

    // p1unit rotate
    this.p1unit.rotation = this.p1unit.body.velocity.y / 1000;

    this.updateLand();
  }


  // LAND
  generateLand ()
    {
        // this.add.image(400, 300, 'sky').setScrollFactor(0);

        this.graphics = this.add.graphics();

        this.topPath = new Phaser.Curves.Path(0, Phaser.Math.Between(200, 100));
        this.bottomPath = new Phaser.Curves.Path(0, Phaser.Math.Between(400, 500));

        // this.p1unit = this.add.image(100, 300, 'p1unit');

        // this.input.on('pointermove', pointer => {

            // this.p1unit.x = pointer.worldX;
            // this.p1unit.y = pointer.worldY;

        // });

        //  Create a random land which is 1000px long (800 for our screen size + 200 buffer)

        let ty = Phaser.Math.Between(200, 100);
        let by = Phaser.Math.Between(400, 500);

        for (let x = 200; x <= 1000; x += 200)
        {
            this.topPath.lineTo(x, ty);
            this.bottomPath.lineTo(x, by);

            ty = Phaser.Math.Between(200, 100);
            by = Phaser.Math.Between(400, 500);
        }

        this.offset = 0;
    }

    updateLand ()
    {
        //  Scroll the camera at a fixed speed
        const speed = 2;

        this.cameras.main.scrollX += speed;
        this.p1unit.x += speed;


        this.offset += speed;

        //  Every 200 pixels we'll generate a new chunk of land
        if (this.offset >= 200)
        {
            //  We need to generate a new section of the land as we've run out
            let ty = Phaser.Math.Between(200, 100);
            let by = Phaser.Math.Between(400, 500);

            const topEnd = this.topPath.getEndPoint();
            const bottomEnd = this.bottomPath.getEndPoint();

            this.topPath.lineTo(topEnd.x + 200, ty);
            this.bottomPath.lineTo(bottomEnd.x + 200, by);

            this.offset = 0;
        }

        //  Get the position of the p1unit on the path
        const x = this.p1unit.x / (1000 + this.cameras.main.scrollX - this.offset);

        //  These vec2s contain the x/y of the p1unit on the path
        //  By checking the p1unit.y value against the top.y and bottom.y we know if it's hit the wall or not
        const top = this.topPath.getPoint(x);
        const bottom = this.bottomPath.getPoint(x);

        //  Draw it
        this.graphics.clear();

        //  This will give a debug draw style with just lines:

        this.graphics.lineStyle(1, 0x000000, 1);
        this.topPath.draw(this.graphics);
        this.bottomPath.draw(this.graphics);

        //  And this will give a filled Graphics landscape:
        this.drawLand(this.topPath, 0);
        this.drawLand(this.bottomPath, 600);

        //  Draw the markers to show where on the path we are
        this.graphics.fillStyle(0x00ff00);
        this.graphics.fillRect(top.x - 2, top.y - 2, 5, 5);
        this.graphics.fillRect(bottom.x - 2, bottom.y - 2, 5, 5);

        // check if p1unit is hitting the wall
        if (this.p1unit.y < top.y + 10 || this.p1unit.y > bottom.y - 10) {
          this.p1unit.setTint(0xff0000);
        } else {
          this.p1unit.clearTint();
        }
    }

    drawLand (path, offsetY)
    {
        const points = [ { x: 0, y: offsetY }];

        let lastX;

        for (let i = 0; i < path.curves.length; i++)
        {
            const curve = path.curves[i];

            points.push(curve.p0, curve.p1);

            lastX = curve.p1.x;
        }

        points.push({ x: lastX, y: offsetY });

        // grey
        this.graphics.fillStyle(0x333333);
        this.graphics.fillPoints(points, true, true);
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
