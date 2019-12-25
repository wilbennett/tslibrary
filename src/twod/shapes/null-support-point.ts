import { PolygonShape, Shape, SupportPoint } from '.';
import { pos, Vector } from '../../vectors';

let NULL_SHAPE: Shape;

export class NullSupportPoint implements SupportPoint {
  static instance = new NullSupportPoint();
  get shape() { return NULL_SHAPE || (NULL_SHAPE = new PolygonShape([pos(0, 0)])); }
  get point() { return Vector.empty; }
  get worldPoint() { return Vector.empty; }
  get direction() { return Vector.empty; }
  get worldDirection() { return Vector.empty; }
  get index() { return NaN; }
  get distance() { return NaN; }
  get isValid() { return false; }

  clear() { }
  clone(result?: SupportPoint): SupportPoint { return result || this; }
}
