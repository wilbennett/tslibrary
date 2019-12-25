import { Edge, Shape } from '.';
import { Vector } from '../../vectors';

export class WorldEdge implements Edge {
  constructor(
    public shape: Shape,
    public index: number,
    public start: Vector,
    public end: Vector,
    public normal: Vector) {
  }
  clone(result?: Edge): Edge {
    if (result) {
      result.shape = this.shape;
      result.index = this.index;
      result.start = this.start.clone();
      result.end = this.end.clone();
      result.normal = this.normal.clone();
      return result;
    }

    return new WorldEdge(this.shape, this.index, this.start.clone(), this.end.clone(), this.normal.clone());
  }
}
