export default class Wave {
  constructor(scene, startX, endX) {
    this.scene = scene;
    this.waveStartX = startX;
    this.waveStartY = 0;
    this.waveEndX = endX;
    this.waveEndY = scene.scale.height;

    if (startX > endX) {
      this.waveStartX += scene.scale.width;
      this.waveEndX += scene.scale.width;
    } else {
      this.waveStartX -= scene.scale.width;
      this.waveEndX -= scene.scale.width;
    }

    this.wave = scene.add.graphics();
    this.wave.lineStyle(2, 0xffffff, 1);
    this.wave.beginPath();
    this.wave.moveTo(this.waveStartX, this.waveStartY);
    this.wave.lineTo(this.waveEndX, this.waveEndY);
    this.wave.closePath();
    this.wave.strokePath();
  }

  update() {
    const direction = this.waveStartX < this.waveEndX ? 1 : -1;
    this.wave.x += 5 * direction;
    this.waveStartX += 5 * direction;
    this.waveEndX += 5 * direction;
  }
}