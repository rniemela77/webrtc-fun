export function updateSpaceshipPosition(scene) {
  const { spaceship, spaceshipVelocity, input, spaceshipSpeed, spaceshipDrag, maxSpeed } =
    scene;

  // keyboard movement
  if (input.keyboard.addKey("a").isDown) {
    spaceshipVelocity.x -= spaceshipSpeed;
  }
  if (input.keyboard.addKey("d").isDown) {
    spaceshipVelocity.x += spaceshipSpeed;
  }

  // mouse movement
  // if pointer is down
  if (input.activePointer.isDown) {
    if (input.x < spaceship.x) {
      spaceshipVelocity.x -= spaceshipSpeed;
    } else {
      spaceshipVelocity.x += spaceshipSpeed;
    }
  }

  // max speed
  if (spaceshipVelocity.x > maxSpeed) {
    spaceshipVelocity.x = maxSpeed;
  } else if (spaceshipVelocity.x < -maxSpeed) {
    spaceshipVelocity.x = -maxSpeed;
  }

  spaceshipVelocity.x *= spaceshipDrag;

  // Update spaceship position
  spaceship.x += spaceshipVelocity.x * spaceshipAcceleration;

  // if the spaceship x velocity is greater than 0.1, rotate the spaceship
  if (Math.abs(spaceshipVelocity.x) > 0.1) {
    spaceship.angle = spaceshipVelocity.x * 5;
  }

  // rotate camera somewhat
  scene.cameras.main.rotation = spaceshipVelocity.x * -0.01;
}

export function createWakeEffect(scene, spaceship) {
  scene.time.addEvent({
    delay: 100,
    callback: () => {
      // every time the spaceship moves, create a wake effect
      const wake = scene.add.graphics();
      wake.fillStyle(0x0000ff);
      const worldPoint = spaceship.getTopCenter();
      const wakeWidth = 2;
      const wakeHeight = 5;

      // Create custom properties to track the width and height
      const wakeData = { width: wakeWidth, height: wakeHeight };

      wake.fillRect(worldPoint.x, worldPoint.y, wakeWidth, wakeHeight);

      // Tween the width and height of the wake
      scene.tweens.add({
        targets: wakeData, // Custom object that tracks the size
        duration: 1000,
        width: 55,
        height: 0,
        onUpdate: function () {
          // Clear and redraw the wake with updated width/height
          wake.clear();
          wake.fillStyle(0x0000ff);
          wake.fillRect(
            worldPoint.x - wakeData.width / 2,
            worldPoint.y,
            wakeData.width,
            wakeData.height
          );
          wake.y += 1;
        },
        onComplete: () => {
          wake.destroy();
        },
      });
    },
    loop: true,
  });
}
