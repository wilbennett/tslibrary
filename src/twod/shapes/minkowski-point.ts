import { Shape } from '.';
import { Vector } from '../../vectors';

const ZERO_DIRECTION = Vector.createDirection(0, 0);

export class MinkowskiPoint {
  constructor(
    public shapeA: Shape,
    public shapeB: Shape,
    public point: Vector,
    public worldPointA: Vector,
    public worldPointB: Vector,
    public indexA: number,
    public indexB: number,
    public worldDirection: Vector = ZERO_DIRECTION) {
  }

  get pointA() { return this.shapeA.vertexList.items[this.indexA]; }
  get pointB() { return this.shapeB.vertexList.items[this.indexB]; }
  get directionA() { return this.shapeA.toLocal(this.worldDirection); }
  get directionB() { return this.shapeB.toLocal(this.worldDirection.negateO()); }
};

