import { ColliderBase, ShapePair } from '.';
import { dir, Vector } from '../../vectors';
import { MinkowskiDiffIterator, MinkowskiPoint, Simplex, SimplexCallback, SupportPoint } from '../shapes';
import * as Minkowski from '../shapes/minkowski';

const ZERO_DIRECTION = dir(0, 0);

export class Wcb extends ColliderBase {
  isCollidingProgress(shapes: ShapePair, callback?: SimplexCallback): boolean | undefined {
    const { first, second } = shapes;
    let simplex: Simplex | undefined = undefined;
    let points: SupportPoint[];

    // This normally gets us closest to the origin.
    // let direction = first.position.subO(second.position);
    //* Use it because swapping mka and mkb is faster than getting support when not colliding.
    //* This normally gets us furthest from to the origin.
    let direction = second.position.subO(first.position);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    let mka = Minkowski.getDiffPoint(first, second, direction);
    mka.adjustDiffPointIfCircle();
    let a = mka.worldPoint;

    if (callback) {
      simplex = new Simplex();
      points = simplex.points;
      direction.clone(simplex.direction);
      points.push(mka.clone());
      callback && callback(simplex.clone());
      direction = simplex.direction;
    }

    direction.negate();

    if (a.dot(direction) > 0) return false; // a is in front of origin in direction.

    let mkb = Minkowski.getDiffPoint(first, second, direction);
    mkb.adjustDiffPointIfCircle();
    let b = mkb.worldPoint;

    if (callback) {
      points!.push(mkb.clone());
      callback(simplex!.clone());
    }

    if (b.dot(direction) <= 0) return false; // b did not cross origin in direction.

    if (a.magSquared < b.magSquared) {
      const temp = mka;
      mka = mkb;
      mkb = temp;

      direction.negate();
      a = mka.worldPoint;
      b = mkb.worldPoint;

      if (callback) {
        points!.shift();
        points!.push(mkb.clone());
        callback(simplex!.clone());
      }
    }

    const ao = a.negateO();
    const ab = b.subO(a);

    return ao.cross2D(ab) < 0
      ? this.walkCcwProgress(mka, mkb, ao, simplex, callback)
      : this.walkCwProgress(mka, mkb, ao, simplex, callback);
  }

  protected walkCcwProgress(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    ao: Vector,
    simplex?: Simplex,
    callback?: SimplexCallback): boolean | undefined {
    const a = mka.worldPoint;
    const b = mkb.worldPoint.clone();
    let mkc = new MinkowskiDiffIterator(mkb);
    let i = mkc.vertexCount;
    let points: SupportPoint[];

    mkc.next();
    let c = mkc.worldPoint;

    if (callback) {
      const ab = b.subO(a);
      ab.perpLeftO(simplex!.direction);
      points = simplex!.points;
      points.push(mkc.clone());
      callback(simplex!.clone());
    }

    const ac = c.subO(a);

    while (ao.cross2D(ac) < 0 && i-- > 0) {
      b.copyFrom(c);
      mkc.next();
      c = mkc.worldPoint;
      c.subO(a, ac);

      if (callback) {
        points!.splice(1, 1);
        points!.push(mkc.clone());
        callback(simplex!.clone());
      }
    }

    const bo = b.negateO();
    const bc = c.subO(b);
    const containsOrigin = bo.cross2D(bc) <= 0;
    return containsOrigin;
  }

  protected walkCwProgress(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    ao: Vector,
    simplex?: Simplex,
    callback?: SimplexCallback): boolean | undefined {
    const a = mka.worldPoint;
    const b = mkb.worldPoint.clone();
    let mkc = new MinkowskiDiffIterator(mkb);
    let i = mkc.vertexCount;
    let points: SupportPoint[];

    mkc.prev();
    let c = mkc.worldPoint;

    if (callback) {
      const ab = b.subO(a);
      ab.perpRightO(simplex!.direction);
      points = simplex!.points;
      points!.push(mkc.clone());
      callback(simplex!.clone());
    }

    const ac = c.subO(a);

    while (ao.cross2D(ac) > 0 && i-- > 0) {
      b.copyFrom(c);
      mkc.prev();
      c = mkc.worldPoint;
      c.subO(a, ac);

      if (callback) {
        points!.splice(1, 1);
        points!.push(mkc.clone());
        callback(simplex!.clone());
      }
    }

    const bo = b.negateO();
    const bc = c.subO(b);
    const containsOrigin = bo.cross2D(bc) >= 0;
    return containsOrigin;
  }

  protected isCollidingCore(shapes: ShapePair): boolean | undefined {
    return this.isCollidingProgress(shapes);
  }
}
