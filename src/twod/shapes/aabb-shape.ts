import { IAABBShape, PolygonShapeBase } from '.';
import { ContextProps, IntegratorConstructor, Viewport } from '..';
import { Vector, VectorClass, VectorGroups } from '../../vectors';

export class AABBShape extends PolygonShapeBase implements IAABBShape {
  kind: "aabb" = "aabb";

  constructor(
    halfSize: Vector,
    integratorType?: IntegratorConstructor,
    // @ts-ignore - unused param.
    vectorClass?: VectorClass) {
    super(new VectorGroups(), halfSize.maxElement, undefined, integratorType);

    this.halfSize = halfSize;
  }

  readonly halfSize: Vector;
  get min() { return this.halfSize.negateN().asPosition(); }
  get max() { return this.halfSize.asPositionN(); }

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    ctx.beginPath().rect(this.min, this.halfSize.scaleN(2));

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
