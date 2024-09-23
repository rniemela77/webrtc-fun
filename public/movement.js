export function updateSpaceshipPosition(scene) {
  const { spaceship, spaceshipVelocity, input, spaceshipSpeed } = scene;

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

  // Update spaceship position
  spaceship.x += spaceshipVelocity.x;
}
