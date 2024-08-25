class Example extends Phaser.Scene {
  preload() {
    this.load.image("vehicle", "circle.png");  // Replace with a square image
  }

  create() {
    this.generateLand();

    this.vehicle = this.add.sprite(width / 2, height - height / 4, "vehicle"); // Set initial y-position
    this.vehicle.setScale(0.5);  // Scale down the vehicle size
  }

  update() {
    this.updateLand();
    this.handleVehicleMovement();
  }

  generateLand() {
    this.graphics = this.add.graphics();

    this.leftPath = new Phaser.Curves.Path(Phaser.Math.Between(100, 200), 0);
    this.rightPath = new Phaser.Curves.Path(Phaser.Math.Between(400, 500), 0);

    let lx = Phaser.Math.Between(100, 200);
    let rx = Phaser.Math.Between(400, 500);

    for (let y = 200; y <= 1000; y += 200) {
      this.leftPath.lineTo(lx, y);
      this.rightPath.lineTo(rx, y);

      lx = Phaser.Math.Between(100, 200);
      rx = Phaser.Math.Between(400, 500);
    }

    this.offset = 0;
  }

  updateLand() {
    const speed = 2;

    this.cameras.main.scrollY += speed;
    this.offset += speed;

    if (this.offset >= 200) {
      let lx = Phaser.Math.Between(100, 200);
      let rx = Phaser.Math.Between(400, 500);

      const leftEnd = this.leftPath.getEndPoint();
      const rightEnd = this.rightPath.getEndPoint();

      this.leftPath.lineTo(lx, leftEnd.y + 200);
      this.rightPath.lineTo(rx, rightEnd.y + 200);

      this.offset = 0;
    }

    const y = (this.vehicle.y - this.cameras.main.scrollY) / (1000 + this.cameras.main.scrollY - this.offset);

    const left = this.leftPath.getPoint(y);
    const right = this.rightPath.getPoint(y);

    this.graphics.clear();

    this.graphics.lineStyle(1, 0x000000, 1);
    this.leftPath.draw(this.graphics);
    this.rightPath.draw(this.graphics);

    this.drawLand(this.leftPath, 0);
    this.drawLand(this.rightPath, 600);

    // draw square on land at the y position of the vehicle
    this.graphics.fillStyle(0x00ffff);
    this.graphics.fillRect(left.x - 5, this.vehicle.y, 10, 10);
    this.graphics.fillRect(right.x - 5, this.vehicle.y, 10, 10);
  }

  handleVehicleMovement() {
    this.input.on('pointerdown', pointer => {
      if (pointer.x < this.vehicle.x) {
        // Steer left with a tween
        this.tweens.add({
          targets: this.vehicle,
          x: this.vehicle.x - 50,
          ease: 'Power2',
          duration: 300,
        });
      } else if (pointer.x > this.vehicle.x) {
        // Steer right with a tween
        this.tweens.add({
          targets: this.vehicle,
          x: this.vehicle.x + 50,
          ease: 'Power2',
          duration: 300,
        });
      }
    });

    // Keep the vehicle within screen bounds
    this.vehicle.x = Phaser.Math.Clamp(this.vehicle.x, 0, width);

    // move the vehicle down
    this.vehicle.y += 2;
  }

  drawLand(path, offsetX) {
    const points = [{ x: offsetX, y: 0 }];

    let lastY;

    for (let i = 0; i < path.curves.length; i++) {
      const curve = path.curves[i];

      points.push(curve.p0, curve.p1);

      lastY = curve.p1.y;
    }

    points.push({ x: offsetX, y: lastY });

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
