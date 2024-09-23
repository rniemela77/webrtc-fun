export default class Wave {
  constructor(scene, startX, endX) {
    this.scene = scene;
    this.waveStartX = startX;
    this.waveStartY = 0;
    this.waveEndX = endX;
    this.waveEndY = scene.scale.height;
    this.waveSpeed = this.generateWaveSpeed();

    this.adjustWavePosition(startX, endX);
    this.createWaveGraphics();
  }

  generateWaveSpeed() {
    // Generates a random speed for the wave between 1 and 4
    return Math.random() * 3 + 1;
  }

  adjustWavePosition(startX, endX) {
    // Adjusts the wave position based on the start and end X coordinates
    const sceneWidth = this.scene.scale.width;
    if (startX > endX) {
      this.waveStartX += sceneWidth;
      this.waveEndX += sceneWidth;
    } else {
      this.waveStartX -= sceneWidth;
      this.waveEndX -= sceneWidth;
    }
  }

  createWaveGraphics() {
    // Creates the wave graphics and adds it to the scene
    this.wave = this.scene.add.graphics();
    this.wave.lineStyle(2, 0xffffff, 1);
    this.wave.beginPath();
    this.wave.moveTo(this.waveStartX, this.waveStartY);
    this.wave.lineTo(this.waveEndX, this.waveEndY);
    this.wave.closePath();
    this.wave.strokePath();
  }

  update() {
    // Updates the wave position based on its speed and direction
    const direction = this.waveStartX < this.waveEndX ? 1 : -1;
    this.wave.x += this.waveSpeed * direction;
    this.waveStartX += this.waveSpeed * direction;
    this.waveEndX += this.waveSpeed * direction;
  }

  getDistanceToPoint(x, y) {
    // Calculates the distance from a point (x, y) to the wave
    const { waveStartX, waveStartY, waveEndX, waveEndY } = this;
    const A = x - waveStartX;
    const B = y - waveStartY;
    const C = waveEndX - waveStartX;
    const D = waveEndY - waveStartY;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;

    if (param < 0) {
      xx = waveStartX;
      yy = waveStartY;
    } else if (param > 1) {
      xx = waveEndX;
      yy = waveEndY;
    } else {
      xx = waveStartX + param * C;
      yy = waveStartY + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
}