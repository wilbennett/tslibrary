import { createPolyData, IAABBShape, PolygonShapeBase } from '.';
import { ContextProps, IntegratorClass, populatePolyEdgeNormals, Viewport } from '..';
import { Vector, VectorClass } from '../../vectors';

export class AABBShape extends PolygonShapeBase implements IAABBShape {
  kind: "aabb" = "aabb";

  constructor(
    halfSize: Vector,
    integratorType?: IntegratorClass,
    vectorClass?: VectorClass) {
    super(createPolyData(4, vectorClass), halfSize.maxElement, undefined, integratorType);

    this.halfSize = halfSize;
    const vertices = this.vertexList.items;
    const hs = halfSize.asPositionO();
    hs.withNegYO(vertices[0]);
    hs.copyTo(vertices[1]);
    hs.withNegXO(vertices[2]);
    hs.negateO(vertices[3]);

    populatePolyEdgeNormals(this.data);
  }

  readonly halfSize: Vector;
  get min() { return this.vertexList.items[3]; }
  get max() { return this.vertexList.items[1]; }
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
