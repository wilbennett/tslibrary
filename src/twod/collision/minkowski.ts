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
  static getPoint(shapes: ShapePair, direction: Vector): Tristate<MinkowskiPoint> {
    const { first, second } = shapes;
    const infoA = first.getSupportPoint(first.toLocal(direction));
    const infoB = second.getSupportPoint(second.toLocal(direction.negateO()));
    let pointA: Vector;
    let pointB: Vector;
    let indexA: number;
    let indexB: number;

    if (typeof infoA === "number") {
      pointA = first.vertexList.items[infoA];
      indexA = infoA;
    } else if (!infoA) {
      return infoA;
    } else {
      pointA = infoA;
      indexA = -1;
    }

    if (typeof infoB === "number") {
      pointB = second.vertexList.items[infoB];
      indexB = infoB;
    } else if (!infoB) {
      return infoB;
    } else {
      pointB = infoB;
      indexB = -1;
    }

    return new MinkowskiPoint(pointA, pointB, indexA, indexB, direction);
  }
}
