import { FlowFieldBase } from '.';
import { MathEx } from '../core';
import { Noise, Perlin } from '../noise';
import { Vector } from '../vectors';

export class FlowFieldNoise extends FlowFieldBase {
  constructor(width: number, height: number, boundsSize: Vector) {
    super();

    this.width = width;
    this.height = height;
    this.boundsSize = boundsSize;

    this._noise = new Perlin();
    this.updateNoiseRange();
  }

  protected _noise: Noise;
  get noise() { return this._noise; }
  set noise(value) {
    this._noise = value;
    this.updateNoiseRange();
  }
  get minAngle() { return this._minAngle; }
  set minAngle(value) {
    super.minAngle = value;
    this.updateNoiseRange();
  }
  get maxAngle() { return this._maxAngle; }
  set maxAngle(value) {
    super.maxAngle = value;
    this.updateNoiseRange();
  }
  _xStartOffset: number = 0;
  get xStartOffset() { return this._xStartOffset; }
  set xStartOffset(value) {
    this._xStartOffset = value;
    this._data = undefined;
  }
  _yStartOffset: number = 0;
  get yStartOffset() { return this._yStartOffset; }
  set yStartOffset(value) {
    this._yStartOffset = value;
    this._data = undefined;
  }
  _zOffset: number = 0;
  get zOffset() { return this._zOffset; }
  set zOffset(value) {
    this._zOffset = value;
    this._data = undefined;
  }
  _xIncrement: number = 0.1;
  get xIncrement() { return this._xIncrement; }
  set xIncrement(value) {
    this._xIncrement = value;
    this._data = undefined;
  }
  _yIncrement: number = 0.1;
  get yIncrement() { return this._yIncrement; }
  set yIncrement(value) {
    this._yIncrement = value;
    this._data = undefined;
  }

  protected generateDataCore(data: Vector[]) {
    const minSpeed = this._minSpeed;
    const maxSpeed = this._maxSpeed;
    const xIncrement = this.xIncrement;
    const yIncrement = this.yIncrement;
    const width = this.width;
    const height = this.height;
    const noise = this._noise;
    let xOffset = this.xStartOffset;
    let yOffset = this.yStartOffset;
    const zOffset = this.zOffset;
    const minAngle = this.minAngle * MathEx.ONE_RADIAN;
    const angleRange = this.maxAngle * MathEx.ONE_RADIAN - minAngle;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const radius = MathEx.randomInt(minSpeed, maxSpeed);
        let angle = noise.getValue3D(xOffset, yOffset, zOffset);
        angle = angle % 360;
        angle = minAngle + (angle % angleRange);
        data[y * width + x] = Vector.fromDegrees(angle, radius, 0);
        xOffset += xIncrement;
      }

      yOffset += yIncrement;
    }
  }

  protected updateNoiseRange() {
    // Compensate for Perlin distribution.
    this.noise.setOutputRange(0, 1000);
    // this.noise.setOutputRange(this.minAngle, this.maxAngle);
  }
}
