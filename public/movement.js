export function updateSpaceshipPosition(spaceship, spaceshipVelocity, gameLoopDelta, spaceshipBoundsPadding, scaleWidth) {
  return;
  
    spaceship.x += (spaceshipVelocity.x * gameLoopDelta) / 100;

  spaceship.x = Phaser.Math.Clamp(
	spaceship.x,
	spaceshipBoundsPadding,
	scaleWidth - spaceshipBoundsPadding
  );
}

export function updateVirtualJoystickMovement(joystick, spaceshipVelocity, maxSpeed) {
  if (!joystick || !joystick.force) return;

  const sensitivity = 0.01;
  const velocity = new Phaser.Math.Vector2(
	joystick.forceX,
	joystick.forceY
  );

  if (velocity.length() > 0) {
	velocity
	  .normalize()
	  .scale(joystick.force * maxSpeed * sensitivity);
	spaceshipVelocity.lerp(velocity, 0.1); // Smooth transition
  } else {
	spaceshipVelocity.scale(0.9); // Gradual stop
  }

  const maxVelocity = 100;
  spaceshipVelocity.x = Phaser.Math.Clamp(
	spaceshipVelocity.x,
	-maxVelocity,
	maxVelocity
  );
  spaceshipVelocity.y = 0; // Y velocity is always 0
}