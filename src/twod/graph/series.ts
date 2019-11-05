import { Vector } from '../../vectors';
import { ContextProps } from '../canvas-context';

export type SeriesFunction = (x: number) => number;

export enum PlotMode { line, dot };

export class Series {
  constructor(public name: string, seriesFunction: SeriesFunction) {
    this._seriesFunction = seriesFunction;
  }

  props: ContextProps = { strokeStyle: "purple", fillStyle: "magenta" };
  plotMode = PlotMode.line;
  lineDash: number[] = [];
  dotRadius = 1;
  dotFill = false;

  private _step: number = 0.1;
  get step() { return this._step; }
  set step(value) { this._step = value; this.reset(); }

  private _startX: number = 0;
  get startX() { return this._startX; }
  set startX(value) { this._startX = value; this.reset(); }

  private _endX: number = 1;
  get endX() { return this._endX; }
  set endX(value) { this._endX = value; this.reset(); }

  private _offset: Vector = Vector.create(0, 0);
  get offset() { return this._offset; }
  set offset(value) { this._offset = value; this.reset(); }

  private _scale: Vector = Vector.create(1, 1);
  get scale() { return this._scale; }
  set scale(value) { this._scale = value; this.reset(); }

  private _seriesFunction: SeriesFunction = x => x;
  get seriesFunction() { return this._seriesFunction; }
  set seriesFunction(value) { this._seriesFunction = value; this.reset(); }

  private readonly _points: Vector[] = [];
  get points() {
    if (this._points.length === 0)
      this.calcPoints();

    return this._points;
  }

  reset() { this._points.splice(0); }

  protected calcPoints() {
    const startX = this.startX;
    const endX = this.endX;
    const scaleX = this.scale.x;
    const scaleY = this.scale.y;
    const offsetX = this.offset.x;
    const offsetY = this.offset.y;
    const step = this.step;
    const func = this._seriesFunction;

    const count = Math.floor((endX - startX) / step + 1);
    const points = this._points;
    points.length = count;
    let x = startX;

    for (let i = 0; i < count; i++) {
      const y = func(x);
      points[i] = Vector.create(x * scaleX + offsetX, y * scaleY + offsetY, 1);
      x = Math.min(x + step, endX);
    }
  }
}
