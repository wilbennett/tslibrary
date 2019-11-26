import { SupportPoint, Winding } from '.';
import { Vector } from '../../vectors';

export type SimplexCallback = (simplex: Simplex) => void;

export class Simplex {
  points: SupportPoint[] = [];
  direction: Vector = Vector.create();
  winding: Winding = Winding.CCW;

  reset() {
    this.points.splice(0);
    this.direction.copyFrom(Vector.empty);
    this.winding = Winding.CCW;
  }

  clone(result?: Simplex) {
    result || (result = new Simplex());
    result.points = this.points.map(p => p.clone());
    result.direction = this.direction.clone();
    result.winding = this.winding;
    return result;
  }
}
