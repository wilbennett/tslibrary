import { ShapePair } from '.';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';

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
  static getPoint(shapes: ShapePair, worldDirection: Vector): Tristate<MinkowskiPoint> {
    const { first, second } = shapes;
    const direction = worldDirection.normalizeO();
    const axis = first.createWorldAxis(direction);
    const spA = first.getSupport(axis);
    const spB = second.getSupport(axis.toLocalOf(second, true));

    if (!spA) return spA;
    if (!spB) return spB;
    if (!spA.isValid || !spB.isValid) return null;

    return new MinkowskiPoint(spA.worldPoint, spB.worldPoint, spA.index, spB.index, direction);
  }
}
