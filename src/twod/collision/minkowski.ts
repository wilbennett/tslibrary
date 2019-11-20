import { ShapePair } from '.';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';
import { ShapeAxis } from '../shapes';

export class MinkowskiPoint {
  constructor(
    public pointA: Vector,
    public pointB: Vector,
    public indexA: number,
    public indexB: number,
    public direction: Vector) {
    this.point = pointA.subO(pointB).asPosition();
  }

  point: Vector;
};

export class Minkowski {
  static getPoint(shapes: ShapePair, direction: Vector): Tristate<MinkowskiPoint> {
    const { first, second } = shapes;
    const directionN = direction.negateO();
    const axisA = new ShapeAxis(first, first.toLocal(direction));
    const axisB = new ShapeAxis(second, second.toLocal(directionN));
    axisA.worldNormal = direction;
    axisB.worldNormal = directionN;
    const spA = first.getSupport(axisA);
    const spB = second.getSupport(axisB);

    if (!spA) return spA;
    if (!spB) return spB;
    if (!spA.isValid || !spB.isValid) return null;

    return new MinkowskiPoint(spA.worldPoint, spB.worldPoint, spA.index, spB.index, direction);
  }
}
