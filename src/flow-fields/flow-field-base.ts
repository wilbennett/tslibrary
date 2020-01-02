import { FlowField, FlowRect } from '.';
import { MathEx } from '../core';
import { dir, Vector } from '../vectors';

export abstract class FlowFieldBase implements FlowField {
  protected _data?: Vector[];
  get data() { return this._data || (this._data = this.generateData()); }
  protected _width = 10;
  get width() { return this._width; }
  set width(value) {
    this._width = value;
    this._data = undefined;
  }
  protected _height = 10;
  get height() { return this._height; }
  set height(value) {
    this._height = value;
    this._data = undefined;
  }
  protected _minAngle: number = 0;
  get minAngle() { return this._minAngle; }
  set minAngle(value) {
    this._minAngle = value;
    this._data = undefined;
  }
  protected _maxAngle: number = MathEx.TWO_PI;
  get maxAngle() { return this._maxAngle; }
  set maxAngle(value) {
    this._maxAngle = value;
    this._data = undefined;
  }
  protected _minSpeed: number = 0;
  get minSpeed() { return this._minSpeed; }
  set minSpeed(value) {
    this._minSpeed = value;
    this._data = undefined;
  }
  protected _maxSpeed: number = 10;
  get maxSpeed() { return this._maxSpeed; }
  set maxSpeed(value) {
    this._maxSpeed = value;
    this._data = undefined;
  }
  protected _boundsSize: Vector = dir(10, 10);
  get boundsSize() { return this._boundsSize; }
  set boundsSize(value) {
    this._boundsSize = value;
    this._cellSize.withXY(this._boundsSize.x / this._width, this._boundsSize.y / this._height);
  }
  protected _cellSize: Vector = dir(1, 1);
  get cellSize() { return this._cellSize; }

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

  generate() { this._data = this.generateData(); }

  protected abstract generateDataCore(data: Vector[]): void;

  protected generateData(): Vector[] {
    const result = new Array<Vector>(this._height * this._width);
    this.generateDataCore(result);
    return result;
  }
}
