import { ColliderBase, ShapePair } from '.';
import { dir, Vector } from '../../vectors';
import { MinkowskiDiffIterator, MinkowskiPoint, Simplex, SimplexCallback, SupportPoint } from '../shapes';
import * as Minkowski from '../shapes/minkowski';

const ZERO_DIRECTION = dir(0, 0);

export class WcbState {
  constructor() {
  }

  mkc?: MinkowskiDiffIterator;
  unsupported?: boolean;
}

export class Wcb extends ColliderBase {
  isCollidingProgress(shapes: ShapePair, callback?: SimplexCallback): boolean | undefined {
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;

    const { first, second } = shapes;
    let simplex: Simplex | undefined = undefined;
    let points: SupportPoint[];
    let direction: Vector | undefined = undefined;

    if (callback) {
      simplex = new Simplex();
      points = simplex.points;
      direction = simplex.direction;
    }

    // This normally gets us closest to the origin.
    // direction = first.position.subO(second.position, direction);
    //* This normally gets us furthest from the origin.
    //* Use it because swapping mka and mkb is faster than getting support when not colliding.
    direction = second.position.subO(first.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    let mka = Minkowski.getDiffPoint(first, second, direction);
    mka.adjustDiffPointIfCircle();
    let a = mka.worldPoint;

    if (callback) {
      points!.push(mka.clone());
      callback && callback(simplex!.clone());
      direction = simplex!.direction;
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

    state.mkc || (state.mkc = new MinkowskiDiffIterator(mkb));
    const ao = a.negateO();
    const ab = b.subO(a);

    return ao.cross2D(ab) < 0
      ? this.walkCcwProgress(mka, mkb, state.mkc, ao, simplex, callback)
      : this.walkCwProgress(mka, mkb, state.mkc, ao, simplex, callback);
  }

  protected walkCcwProgress(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    mkc: MinkowskiDiffIterator,
    ao: Vector,
    simplex?: Simplex,
    callback?: SimplexCallback): boolean | undefined {
    const a = mka.worldPoint;
    const b = mkb.worldPoint.clone();
    let i = mkc.vertexCount;
    let points: SupportPoint[];

    mkc.init(mkb);
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
    mkc: MinkowskiDiffIterator,
    ao: Vector,
    simplex?: Simplex,
    callback?: SimplexCallback): boolean | undefined {
    const a = mka.worldPoint;
    const b = mkb.worldPoint.clone();
    let i = mkc.vertexCount;
    let points: SupportPoint[];

    mkc.init(mkb);
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

  protected getState(shapes: ShapePair) {
    let state = <WcbState>shapes.customData["wcbState"];

    if (!state) {
      // const { first, second } = shapes;
      state = new WcbState();
      shapes.customData["wcbState"] = state;
    }

    return state;
  }
}
