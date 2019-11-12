import { IAABB, PolygonBase } from '.';
import { ContextProps, Viewport } from '..';
import { Vector, Vector2D, VectorCollection } from '../../vectors';

export class AABB extends PolygonBase implements IAABB {
  kind: "aabb" = "aabb";

  constructor(halfSize: Vector) {
    super(new VectorCollection(0, Vector2D), halfSize.maxElement); // TODO: Make dimension agnostic.

    this.halfSize = halfSize;
  }

  readonly halfSize: Vector;
  get min() {
    const result = this.halfSize.negateN();
    return this.position.displaceByO(result, result);
  }
  get max() { return this.position.displaceByN(this.halfSize); }

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    ctx.beginPath().rect(this.min, this.halfSize.scaleN(2));

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
