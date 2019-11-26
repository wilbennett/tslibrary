import {
  EMPTY_SUPPORT_AXES,
  IMinkowskiShape,
  MinkowskiPoint,
  Projection,
  Shape,
  ShapeAxis,
  ShapeBase,
  SupportPoint,
} from '.';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';

export class MinkowskiShape extends ShapeBase implements IMinkowskiShape {
  kind: "minkowski" = "minkowski";

  constructor(readonly shapeA: Shape, readonly shapeB: Shape, isSum: boolean = false) {
    super();

    if (isSum)
      this._isSum = isSum;

    this._isWorld = true;
    this._isTransformDirty = false;
  }

  protected _isSum?: boolean;
  get isSum() { return !!this._isSum; }

  getSupport(direction: Vector, result?: SupportPoint | MinkowskiPoint): Tristate<SupportPoint>;
  getSupport(axis: ShapeAxis, result?: SupportPoint | MinkowskiPoint): Tristate<SupportPoint>;
  getSupport(param1: Vector | ShapeAxis, result?: SupportPoint | MinkowskiPoint): Tristate<SupportPoint> {
    const axisDirection = param1 instanceof Vector ? param1 : param1.normal;
    const axisDirectionB = this._isSum ? axisDirection : axisDirection.negateO();
    const shapeA = this.shapeA;
    const shapeB = this.shapeB;
    const supportA = shapeA.getSupport(shapeA.toLocal(axisDirection));
    const supportB = shapeB.getSupport(shapeB.toLocal(axisDirectionB));

    if (!supportA || !supportB) return undefined;

    const point = this._isSum
      ? supportA.worldPoint.displaceByO(supportB.worldPoint)
      : supportA.worldPoint.displaceByNegO(supportB.worldPoint);

    if (!result) {
      result = new MinkowskiPoint(this.shapeA, this.shapeB, point, supportA.index, supportB.index);
    } else {
      result.clear();

      if (result instanceof MinkowskiPoint) {
        result.shapeA = this.shapeA;
        result.shapeB = this.shapeB;
        result.indexA = supportA.index;
        result.indexB = supportB.index;
      }
    }

    result.shape = this;
    result.point = point;
    result.worldPoint = point;
    result.index = NaN;
    result.distance = NaN;

    if (result instanceof MinkowskiPoint) {
      result.isSum = this._isSum;

      if (param1 instanceof Vector)
        result.directionA = axisDirection;
      else
        result.direction = param1.worldNormal;
    };

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
