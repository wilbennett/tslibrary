import { IPolygonShapeBase, ShapeBase } from '.';
import { ContextProps, IntegratorClass, Viewport } from '..';
import { Vector, VectorGroups } from '../../vectors';
import { movePoly, normalizePolyCenter } from '../geometry';

export abstract class PolygonShapeBase extends ShapeBase implements IPolygonShapeBase {
  constructor(
    data: VectorGroups,
    radius?: number,
    // @ts-ignore - unused param.
    area?: number,
    integratorType?: IntegratorClass) {
    super(integratorType);

    this._data = data;

    if (radius === undefined) {
      [radius] = normalizePolyCenter(this.vertexList);
    }

    this.radius = radius;
  }

  readonly radius: number;

  setPosition(position: Vector) {
    if (this._isWorld)
      movePoly(this.vertexList, this.position, position);

    super.setPosition(position);
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    ctx.beginPath().poly(this.vertexList, true);

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
