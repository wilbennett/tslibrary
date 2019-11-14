import { createPolyData, IAABBShape, PolygonShapeBase } from '.';
import { ContextProps, IntegratorConstructor, Viewport } from '..';
import { Vector, VectorClass } from '../../vectors';

export class AABBShape extends PolygonShapeBase implements IAABBShape {
  kind: "aabb" = "aabb";

  constructor(
    halfSize: Vector,
    integratorType?: IntegratorConstructor,
    vectorClass?: VectorClass) {
    super(createPolyData(4, vectorClass), halfSize.maxElement, undefined, integratorType);

    this.halfSize = halfSize;
    const vertices = this.vertices.items;
    const hs = halfSize.asPositionO();
    hs.negateO(vertices[0]);
    hs.withNegYO(vertices[1]);
    hs.copyTo(vertices[2]);
    hs.withNegXO(vertices[3]);
  }

  readonly halfSize: Vector;
  get min() { return this.vertices.items[0]; }
  get max() { return this.vertices.items[2]; }
  // get min() { return this.halfSize.negateN().asPosition(); }
  // get max() { return this.halfSize.asPositionN(); }

  toWorld(localPoint: Vector, result?: Vector) {
    return super.toWorld(localPoint, result);
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    ctx.beginPath().rect(this.min, this.halfSize.scaleO(2));

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
