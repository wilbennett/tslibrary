import { CanvasContext } from '.';
import { Matrix2D } from '../matrix';
import { Bounds } from '../misc';
import { Vector } from '../vectors';

export class Viewport {
  constructor(ctx: CanvasContext, screenBounds: Bounds, viewBounds: Bounds, worldBounds?: Bounds) {
    if (!worldBounds)
      worldBounds = new Bounds("center", 0, 0, Infinity, Infinity, "up");

    if (screenBounds.direction !== "down")
      screenBounds.withDirection("down");

    if (viewBounds.direction !== "up")
      viewBounds.withDirection("up");

    if (worldBounds.direction !== "up")
      worldBounds.withDirection("up");

    this._ctx = ctx;
    this.screenBounds = screenBounds;
    this.viewBounds = viewBounds;
    this.worldBounds = worldBounds;
  }

  protected _matrix?: Matrix2D;
  protected get matrix() { return this._matrix || (this._matrix = this.calcTransform()); }
  protected _ctx: CanvasContext;
  get ctx() { return this._ctx; }
  set ctx(value) { this._ctx = value; }
  readonly screenBounds: Bounds;
  readonly viewBounds: Bounds;
  readonly worldBounds: Bounds;
  get transform() { return this.matrix.values; }
  get transformInverse() { return this.matrix.inverse; }

  protected _scale?: number;
  get scale() {
    if (this._scale === undefined) {
      const viewSize = this.viewBounds.size;
      const screenSize = this.screenBounds.size;
      this._scale = Math.max(screenSize.x, screenSize.y) / Math.max(viewSize.x, viewSize.y);
    }

    return this._scale;
  }

  protected _isTransformed: boolean = false;

  resetTransform() {
    this._matrix = undefined;
    this._scale = undefined;
  }

  applyTransform() {
    this.ctx
      .save()
      .beginPath()
      .rect(this.screenBounds)
      .clip()
      .transform(this.transform);

    this._isTransformed = true;
  }

  restoreTransform() {
    this.ctx.restore();
    this._isTransformed = false;
  }

  calcLineWidth(width: number) { return this._isTransformed ? width / this.scale : width; }

  toScreen(vector: Vector, force: boolean = false, result?: Vector) {
    result = result || Vector.create(0, 0);

    return force || !this._isTransformed
      ? this.matrix.transform(vector, undefined, result)
      : result.copyFrom(vector);
  }

  toWorld(vector: Vector, force: boolean = false, result?: Vector) {
    result = result || Vector.create(0, 0);

    return force || !this._isTransformed
      ? this.matrix.transformInverse(vector, result)
      : result.copyFrom(vector);
  }

  adjustView() {
    const viewMin = this.viewBounds.min;
    const viewMax = this.viewBounds.max;
    const worldMin = this.worldBounds.min;
    const worldMax = this.worldBounds.max;

    if (this.viewBounds.width > this.worldBounds.width)
      this.viewBounds.withSize(this.worldBounds.width, this.viewBounds.height);

    if (this.viewBounds.height > this.worldBounds.height)
      this.viewBounds.withSize(this.viewBounds.width, this.worldBounds.height);

    if (viewMin.x < worldMin.x)
      this.viewBounds.withPosition(this.viewBounds.position.withXN(worldMin.x));

    if (viewMin.y < worldMin.y)
      this.viewBounds.withPosition(this.viewBounds.position.withYN(worldMin.y));

    if (viewMax.x > worldMax.x)
      this.viewBounds.withPosition(this.viewBounds.position.withXN(worldMax.x - this.viewBounds.size.x));

    if (viewMax.y > worldMax.y)
      this.viewBounds.withPosition(this.viewBounds.position.withYN(worldMax.y - this.viewBounds.size.y));
  }

  protected calcTransform() {
    const result = new Matrix2D();
    this.adjustView();

    result.translate(this.screenBounds.center);
    result.scale(this.scale);
    result.translate(this.viewBounds.center.multN(-1, 1));
    result.scale(1, -1);

    return result;
  }
}
