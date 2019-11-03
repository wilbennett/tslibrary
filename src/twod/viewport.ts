import { CanvasContext } from '.';
import { Matrix2D } from '../matrix';
import { Bounds } from '../misc';
import { Vector } from '../vectors';

export class Viewport {
  constructor(
    ctx: CanvasContext,
    screenBounds: Bounds,
    viewBounds: Bounds,
    worldBounds: Bounds) {
    this.ctx = ctx;
    this.screenBounds = screenBounds;
    this.viewBounds = viewBounds;
    this.worldBounds = worldBounds;
  }

  protected _matrix?: Matrix2D;
  protected get matrix() { return this._matrix || (this._matrix = this.calcTransform()); }
  readonly ctx: CanvasContext;
  readonly screenBounds: Bounds;
  readonly viewBounds: Bounds;
  readonly worldBounds: Bounds;
  get transform() { return this.matrix.values; }
  get transformInverse() { return this.matrix.inverse; }

  get scale() {
    const viewSize = this.viewBounds.size;
    return this.screenBounds.size.multN(1 / viewSize.x, 1 / viewSize.y, 1);
  }

  protected _isTransformed: boolean = false;

  resetTransform() { this._matrix = undefined; }

  applyTransform() {
    this.ctx
      .save()
      .beginPath()
      .rect(this.screenBounds)
      .clip()
      .setTransform(this.transform);

    this._isTransformed = true;
  }

  restoreTransform() {
    this.ctx.restore();
    this._isTransformed = false;
  }

  toScreen(vector: Vector, force: boolean = false) {
    return force || !this._isTransformed ? this.matrix.transform(vector) : vector;
  }

  toWorld(vector: Vector, force: boolean = false) {
    return force || !this._isTransformed ? this.matrix.transformInverse(vector) : vector;
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
