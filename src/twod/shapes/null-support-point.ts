import { PolygonShape, SupportPoint } from '.';
import { pos, Vector } from '../../vectors';

const NULL_SHAPE = new PolygonShape([pos(0, 0)]);

export class NullSupportPoint implements SupportPoint {
  get shape() { return NULL_SHAPE; }
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
