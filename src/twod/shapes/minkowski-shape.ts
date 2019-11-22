import { EMPTY_SUPPORT_AXES, IMinkowskiShape, Projection, Shape, ShapeAxis, ShapeBase, SupportPoint } from '.';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';

export class MinkowskiShape extends ShapeBase implements IMinkowskiShape {
  kind: "minkowski" = "minkowski";

  constructor(readonly first: Shape, readonly second: Shape, isSum: boolean = false) {
    super();

    if (isSum)
      this._isSum = isSum;

    this._isWorld = true;
    this._isTransformDirty = false;
  }

  protected _isSum?: boolean;
  get isSum() { return !!this._isSum; }

  getSupport(direction: Vector, result?: SupportPoint): Tristate<SupportPoint>;
  getSupport(axis: ShapeAxis, result?: SupportPoint): Tristate<SupportPoint>;
  getSupport(param1: Vector | ShapeAxis, result?: SupportPoint): Tristate<SupportPoint> {
    const axisDirection = param1 instanceof Vector ? param1 : param1.normal;
    const axisDirectionB = this._isSum ? axisDirection : axisDirection.negateO();
    const first = this.first;
    const second = this.second;
    const supportA = first.getSupport(first.toLocal(axisDirection));
    const supportB = second.getSupport(second.toLocal(axisDirectionB));

    if (!supportA || !supportB) return undefined;

    const point = this._isSum
      ? supportA.worldPoint.displaceByO(supportB.worldPoint)
      : supportA.worldPoint.displaceByNegO(supportB.worldPoint);

    result || (result = new SupportPoint(this));

    result.clear();
    result.shape = this;
    result.point = point;
    result.worldPoint = point;
    result.index = NaN;
    result.distance = NaN;
    return result;
  }

  getAxes(result?: ShapeAxis[]) { return result || EMPTY_SUPPORT_AXES; }
  // @ts-ignore - unused param.
  projectOn(worldAxis: Vector, result?: Projection): Tristate<Projection> { return undefined; }
  // @ts-ignore - unused param.
  containsPoint(point: Vector, epsilon: number): boolean | undefined { return undefined; }
  // @ts-ignore - unused param.
  closestPoint(point: Vector, hullOnly: boolean = false, result?: Vector) { return undefined; }
  // @ts-ignore - unused param.
  getIntersectPoint(other: Geometry, result?: Vector): Tristate<Vector> { return undefined; }
  protected dirtyTransform() { }
  protected cleanTransform() { }
}
