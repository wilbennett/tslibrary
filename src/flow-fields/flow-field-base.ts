import { FlowField, FlowRect } from '.';
import { MathEx } from '../core';
import { dir, Vector } from '../vectors';

export abstract class FlowFieldBase implements FlowField {
  protected _data: Vector[] = [];
  get data() {
    this._isDirty && this.generateData();
    return this._data;
  }
  protected _width = 10;
  get width() { return this._width; }
  set width(value) {
    this._width = value;
    this.dirty();
  }
  protected _height = 10;
  get height() { return this._height; }
  set height(value) {
    this._height = value;
    this.dirty();
  }
  protected _minAngle: number = 0;
  get minAngle() { return this._minAngle; }
  set minAngle(value) {
    this._minAngle = value;
    this.dirty();
  }
  protected _maxAngle: number = MathEx.TWO_PI;
  get maxAngle() { return this._maxAngle; }
  set maxAngle(value) {
    this._maxAngle = value;
    this.dirty();
  }
  protected _minSpeed: number = 0;
  get minSpeed() { return this._minSpeed; }
  set minSpeed(value) {
    this._minSpeed = value;
    this.dirty();
  }
  protected _maxSpeed: number = 10;
  get maxSpeed() { return this._maxSpeed; }
  set maxSpeed(value) {
    this._maxSpeed = value;
    this.dirty();
  }
  protected _unitVectors?: boolean;
  get unitVectors() { return !!this._unitVectors; }
  set unitVectors(value) { this._unitVectors = value; }
  protected _boundsSize: Vector = dir(10, 10);
  get boundsSize() { return this._boundsSize; }
  set boundsSize(value) {
    this._boundsSize = value;
    this._cellSize.withXY(this._boundsSize.x / this._width, this._boundsSize.y / this._height);
  }
  protected _cellSize: Vector = dir(1, 1);
  get cellSize() { return this._cellSize; }
  private _isDirty = true;
  protected get isDirty() { return this._isDirty; }
  protected set isDirty(value) {
    if (value)
      this.dirty();
    else
      this.clean();
  }

  getVector(col: number, row: number): Vector {
    return this.data[row * this._width + col];
  }

  getVectorForPoint(point: Vector): Vector {
    const cellSize = this._cellSize;
    const col = Math.floor(point.x / cellSize.x);
    const row = Math.floor(point.y / cellSize.y);
    return this.data[row * this._width + col];
  }

  getCellRect(col: number, row: number): FlowRect {
    const cellSize = this._cellSize;
    const minX = col * cellSize.x;
    const minY = row * cellSize.y;
    const maxX = minX + cellSize.x;
    const maxY = minY + cellSize.y;
    return { minX, minY, maxX, maxY };
  }

  getCellRectForPoint(point: Vector): FlowRect {
    const cellSize = this._cellSize;
    const col = Math.floor(point.x / cellSize.x);
    const row = Math.floor(point.y / cellSize.y);
    const minX = col * cellSize.x;
    const minY = row * cellSize.y;
    const maxX = minX + cellSize.x;
    const maxY = minY + cellSize.y;
    return { minX, minY, maxX, maxY };
  }

  generate() {
    this.generateData();
  }

  protected dirty() { this._isDirty = true; }
  protected clean() { this._isDirty = false; }

  protected abstract generateDataCore(data: Vector[]): void;

  protected generateData() {
    const data = this._data;
    const count = this._height * this._width;
    const currentCount = data.length;
    data.length = count;

    if (count > currentCount) {
      for (let i = currentCount; i < count; i++) {
        data[i] = dir(0, 0);
      }
    }

    this.generateDataCore(data);
    this.clean();
  }
}
