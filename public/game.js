class Racer extends Phaser.Scene {
  constructor() {
    super({ key: "Racer" });
  }

  preload() {
    this.loadImages();
  }

  create() {
    this.createBackground();
    this.createSpaceship();
    this.initializeVariables();
    this.createObstacles();
    this.setupCamera();
    this.setupInput();
    this.createLine();
  }

  update() {
    this.updateObstacles();
    this.updateBackground();
    this.updateSpaceshipMovement();
    this.updateCamera();
    this.updateLine();
    this.checkCollisions();
  }

  checkCollisions() {    
    // Calculate the t-value based on spaceship.y
    const t = this.spaceship.y / this.leftPath.getBounds().height;
    
    // Clamp t to [0, 1] range
    const clampedT = Phaser.Math.Clamp(t, 0, 1);

    // Get the point on the path at the calculated t-value
    const leftPoint = this.leftPath.getPoint(clampedT);
    const rightPoint = this.rightPath.getPoint(clampedT);

    // Check X positions
    const leftX = leftPoint.x;
    const rightX = rightPoint.x;

    // Check if the spaceship is outside the bounds of the path
    if (this.spaceship.x < leftX || this.spaceship.x > rightX) {
        this.spaceship.setTint(0xff0000);
    } else {
        this.spaceship.clearTint();
    }
}


  createLine() {
    this.graphics = this.add.graphics();

    this.leftPath = new Phaser.Curves.Path(Phaser.Math.Between(200, 100), 0);
    this.rightPath = new Phaser.Curves.Path(Phaser.Math.Between(400, 500), 0);

    //  Create a random land which is 1000px high (600 for our screen size + 400 buffer)
    let lx = Phaser.Math.Between(200, 100);
    let rx = Phaser.Math.Between(400, 500);

    for (let y = 200; y <= 1000; y += 200) {
      this.leftPath.lineTo(lx, y);
      this.rightPath.lineTo(rx, y);

      lx = Phaser.Math.Between(200, 100);
      rx = Phaser.Math.Between(400, 500);
    }

    this.offset = 0;
  }

  updateLine() {
    const speed = 2;
    this.offset += speed;

    // Move the land downward by decreasing the y-coordinates
    this.leftPath.curves.forEach((curve) => {
      curve.p0.y += speed;
      curve.p1.y += speed;
    });

    this.rightPath.curves.forEach((curve) => {
      curve.p0.y += speed;
      curve.p1.y += speed;
    });

    if (this.leftPath.curves[0].p0.y > speed * 200) {
      //  We need to generate a new section of the land as we've run out
      let lx = Phaser.Math.Between(100, 200);
      let rx = Phaser.Math.Between(400, 500);

      const leftStart = this.leftPath.getStartPoint();
      const rightStart = this.rightPath.getStartPoint();


      this.leftPath.curves.unshift(new Phaser.Curves.Line(new Phaser.Math.Vector2(lx, leftStart.y - 200), leftStart));
      this.rightPath.curves.unshift(new Phaser.Curves.Line(new Phaser.Math.Vector2(rx, rightStart.y - 200), rightStart));

      this.offset = 0;
    }

    //  Draw it
    this.graphics.clear();

    //  And this will give a filled Graphics landscape:
    this.drawLand(this.leftPath, 0);
    this.drawLand(this.rightPath, 800);
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

    this.graphics.fillStyle(0x7b3a05);
    this.graphics.fillPoints(points, true, true);
  }

  loadImages() {
    this.load.image("background", "path/to/background.png");
    this.load.image("spaceship", "path/to/spaceship.png");
    this.load.image("obstacle", "circle.png");
  }

  createBackground() {
    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "background")
      .setTint(0x252325)
      .setOrigin(0, 0);
  }

  createSpaceship() {
    const spaceshipStartX = this.scale.width / 2;
    const spaceshipStartY = this.scale.height - 50;

    this.spaceship = this.add
      .sprite(spaceshipStartX, spaceshipStartY, "spaceship")
      .setOrigin(0.5, 0.5)
      .setDepth(1);
  }

  initializeVariables() {
    this.spaceshipSpeed = 0;
    this.maxSpeed = 5;
    this.acceleration = 0.2;
    this.deceleration = 0.05;
    this.backgroundSpeed = 5;
    this.cameraZoom = 1.3;
    this.cameraRotationFactor = 0.012;
    this.spaceshipBoundsPadding = 50;
    this.obstacleTypes = [
      {
        type: "rock",
        speed: 2,
        // Tint the obstacle with a red color
        color: 0xcc6666,
        scale: 1,
      },
      {
        type: "asteroid",
        speed: 4,
        color: 0x6666c6,
        scale: 0.8,
      },
      {
        type: "satellite",
        speed: 6,
        color: 0x66c666,
        scale: 0.3,
      },
    ];
  }

  createObstacles() {
    this.obstacles = this.add.group({
      key: "obstacle",
      repeat: 10,
      setXY: { x: 0, y: 0, stepX: 100 },
    });

    this.obstacles.children.iterate((obstacle) => {
      obstacle
        .setTint(0xc66666)
        .setOrigin(0.5, 0)
        .setY(Phaser.Math.Between(0, this.scale.height));

      // Assign a unique speed between 2 and 6 to each obstacle
      obstacle.speed = Phaser.Math.Between(2, 4);

      // Assign a random obstacle type to each obstacle
      const obstacleType = Phaser.Math.RND.pick(this.obstacleTypes);

      obstacle.type = obstacleType.type;
      obstacle.setTint(obstacleType.color);
      obstacle.setScale(obstacleType.scale);
    });
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.startFollow(this.spaceship, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.cameraZoom);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  updateObstacles() {
    this.obstacles.children.iterate((obstacle) => {
      obstacle.y += obstacle.speed;
      if (obstacle.y > this.scale.height + obstacle.displayHeight) {
        obstacle.y = -obstacle.displayHeight;
        obstacle.x = Phaser.Math.Between(0, this.scale.width);
      }

      // Collision detection
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.spaceship.getBounds(),
          obstacle.getBounds()
        )
      ) {
        switch (obstacle.type) {
          case "rock":
            this.spaceship.health -= obstacle.damage;
            break;
          case "power-up":
            this.spaceship.power += obstacle.powerValue;
            break;
          case "hazard":
            this.applyHazardEffect(obstacle.effect);
            break;
          default:
            break;
        }
        // Optionally, reset obstacle position after collision
        obstacle.y = -obstacle.displayHeight;
        obstacle.x = Phaser.Math.Between(0, this.scale.width);
      }
    });
  }

  updateBackground() {
    this.background.tilePositionY -= this.backgroundSpeed;
  }

  updateSpaceshipMovement() {
    if (this.cursors.left.isDown) {
      this.spaceshipSpeed = Math.max(
        this.spaceshipSpeed - this.acceleration,
        -this.maxSpeed
      );
    } else if (this.cursors.right.isDown) {
      this.spaceshipSpeed = Math.min(
        this.spaceshipSpeed + this.acceleration,
        this.maxSpeed
      );
    } else {
      this.spaceshipSpeed *= 1 - this.deceleration;
    }

    this.spaceship.x += this.spaceshipSpeed;
    this.spaceship.x = Phaser.Math.Clamp(
      this.spaceship.x,
      this.spaceshipBoundsPadding,
      this.scale.width - this.spaceshipBoundsPadding
    );
  }

  updateCamera() {
    this.cameras.main.setRotation(
      this.spaceshipSpeed * this.cameraRotationFactor
    );
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
    arcade: {
      debug: true,
    },
  },
  scene: Racer,
};

const game = new Phaser.Game(config);