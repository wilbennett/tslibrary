import { IAABBShape, PolygonShapeBase } from '.';
import { ContextProps, IntegratorClass, Viewport } from '..';
import { MassInfo, Material } from '../../core';
import { Vector, VectorClass } from '../../vectors';

export class AABBShape extends PolygonShapeBase implements IAABBShape {
  kind: "aabb";

  constructor(
    halfSize: Vector,
    material?: Material,
    isWorld: boolean = false,
    massInfo?: MassInfo,
    integratorType?: IntegratorClass,
    vectorClass?: VectorClass) {

    const hs = halfSize.asPositionO();
    const vertices = [hs.withNegYO(), hs, hs.withNegXO(), hs.negateO()];

    super(vertices, true, isWorld, material, massInfo, vectorClass, integratorType);

    this.halfSize = halfSize;
    this.kind = "aabb";
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
