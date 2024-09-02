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
    this.createLongLine();
  }

  update() {
    this.updateObstacles();
    this.updateBackground();
    this.updateSpaceshipMovement();
    this.updateCamera();
    this.updateLine();
    this.checkSpaceshipOnLine();
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
    this.spaceship = this.add
      .sprite(this.scale.width / 2, this.scale.height - 50, "spaceship")
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
      { type: "rock", speed: 2, color: 0xcc6666, scale: 1 },
      { type: "asteroid", speed: 4, color: 0x6666c6, scale: 0.8 },
      { type: "satellite", speed: 6, color: 0x66c666, scale: 0.3 },
    ];
  }

  createObstacles() {
    this.obstacles = this.add.group({ key: "obstacle", repeat: 10, setXY: { x: 0, y: 0, stepX: 100 } });
    
    this.obstacles.children.iterate(obstacle => {
      const type = Phaser.Math.RND.pick(this.obstacleTypes);
      Object.assign(obstacle, { speed: type.speed, type: type.type });
      obstacle
        .setTint(type.color)
        .setScale(type.scale)
        .setOrigin(0.5, 0)
        .setY(Phaser.Math.Between(0, this.scale.height));
    });
  }

  setupCamera() {
    const { width, height } = this.scale;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.spaceship, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.cameraZoom);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createLongLine() {
      this.graphics = this.add.graphics();
      this.path = new Phaser.Curves.Path(this.scale.width / 2, this.scale.height);
      this.linePoints = []; // Reset points array
  
      // Ensure the path length is exactly 1000px
      const totalLength = 1000;
      let accumulatedLength = 0;
      let currentX = this.scale.width / 2;
      let currentY = this.scale.height;
      const segmentLength = 500; // Example segment length
  
      this.path.moveTo(currentX, currentY);
      this.linePoints.push({ x: currentX, y: currentY }); // Store initial point
  
      while (accumulatedLength + segmentLength < totalLength) {
          const nextX = Phaser.Math.Between(this.scale.width / 3, (this.scale.width / 3) * 2);
          const nextY = currentY - segmentLength;
  
          // Ensure the next point is further down
          if (nextY < currentY) {
              this.path.lineTo(nextX, nextY);
              this.linePoints.push({ x: nextX, y: nextY }); // Store coordinates
  
              accumulatedLength += segmentLength;
              currentX = nextX;
              currentY = nextY;
          }
      }
  
      // Make sure the path ends exactly at 1000px height
      const finalY = this.scale.height - totalLength;
      this.path.lineTo(this.scale.width / 2, finalY);
      this.linePoints.push({ x: this.scale.width / 2, y: finalY }); // Store final point
  
      this.drawPath();
  }
  
  drawPath() {
      this.graphics.clear();
      this.graphics.lineStyle(90, 0xffffff, 1);
      this.path.draw(this.graphics);
  }
  
  // Add this method to check the distance between the spaceship and the path points
  isNearPath(spaceship, pathPoints, threshold) {
      for (let point of pathPoints) {
          const distance = Phaser.Math.Distance.Between(spaceship.x, spaceship.y, point.x, point.y);
          if (distance < threshold) {
              return true;
          }
      }
      return false;
  }
  
  // Update the updateLine method to include collision detection
  updateLine() {
      this.path.curves.forEach(curve => {
          ['p0', 'p1', 'p2', 'p3'].forEach(point => {
              if (curve[point]?.y !== undefined) {
                  curve[point].y += 1; // Move path downward
              }
          });
      });
  
      this.linePoints.forEach(point => {
          point.y += 1; // Move path points downward
      });
  
      // Check if the spaceship is near the path
      const threshold = 50; // Adjust this value as needed
      if (this.isNearPath(this.spaceship, this.linePoints, threshold)) {
          this.spaceship.setTint(0xff0000); // Change tint to red
      } else {
          this.spaceship.clearTint(); // Clear tint
      }
  
      // Redraw the path after moving it
      this.drawPath();
  }

  updateObstacles() {
    this.obstacles.children.iterate(obstacle => {
      obstacle.y += obstacle.speed;

      if (obstacle.y > this.scale.height + obstacle.displayHeight) {
        obstacle.y = -obstacle.displayHeight;
        obstacle.x = Phaser.Math.Between(0, this.scale.width);
      }

      if (Phaser.Geom.Intersects.RectangleToRectangle(this.spaceship.getBounds(), obstacle.getBounds())) {
        this.handleCollision(obstacle);
        obstacle.y = -obstacle.displayHeight;
        obstacle.x = Phaser.Math.Between(0, this.scale.width);
      }
    });
  }

  handleCollision(obstacle) {
    switch (obstacle.type) {
      case "rock":
        this.spaceship.health -= obstacle.damage || 10; // Default damage
        break;
      case "power-up":
        this.spaceship.power = (this.spaceship.power || 0) + (obstacle.powerValue || 1);
        break;
      case "hazard":
        this.applyHazardEffect(obstacle.effect);
        break;
    }
  }

  updateBackground() {
    this.background.tilePositionY -= this.backgroundSpeed;
  }

  updateSpaceshipMovement() {
    const cursors = this.cursors;

    if (cursors.left.isDown) {
        this.spaceshipSpeed = Math.max(this.spaceshipSpeed - this.acceleration, -this.maxSpeed);
        this.spaceship.angle -= 3; // Rotate left
    } else if (cursors.right.isDown) {
        this.spaceshipSpeed = Math.min(this.spaceshipSpeed + this.acceleration, this.maxSpeed);
        this.spaceship.angle += 3; // Rotate right
    } else {
        this.spaceshipSpeed *= 1 - this.deceleration;
    }

    // Apply smooth movement
    this.spaceship.x += this.spaceshipSpeed;
    this.spaceship.x = Phaser.Math.Clamp(this.spaceship.x, this.spaceshipBoundsPadding, this.scale.width - this.spaceshipBoundsPadding);

    // Smooth rotation
    this.spaceship.angle = Phaser.Math.Angle.Wrap(this.spaceship.angle);
}

updateCamera() {
    // Adjust camera rotation to follow the spaceship’s rotation
    this.cameras.main.rotation = Phaser.Math.Angle.Wrap(this.spaceship.angle * this.cameraRotationFactor);
}


  updateCamera() {
    this.cameras.main.setRotation(this.spaceshipSpeed * this.cameraRotationFactor);
  }

  checkSpaceshipOnLine() {
    const tolerance = 50;
    const points = this.path.getPoints(50);

    const isOnLine = points.some(point =>
      Phaser.Math.Distance.Between(this.spaceship.x, this.spaceship.y, point.x, point.y) < tolerance
    );

    this.spaceship.setTint(isOnLine ? 0xff0000 : 0xffffff);
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
  scene: Racer,
};

const game = new Phaser.Game(config);
