import { SupportPoint, Winding } from '.';
import { Vector } from '../../vectors';
import { Contact } from '../collision';

export type SimplexState = {
  simplices?: Simplex[];
  contact?: Contact;
};

export type SimplexCallback = (state: SimplexState) => void;

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
