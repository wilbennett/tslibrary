import { ColliderBase, ShapePair } from '.';
import { dir, Vector } from '../../vectors';
import {
  MinkowskiDiffIterator,
  MinkowskiPoint,
  Simplex,
  SimplexCallback,
  SupportPoint,
  SupportPointImpl,
} from '../shapes';
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

    const { shapeA, shapeB } = shapes;
    let mkSimplex: Simplex | undefined = undefined;
    let spSimplex: Simplex | undefined = undefined;
    let mkPoints: SupportPoint[];
    let spPoints: SupportPoint[];
    let direction: Vector | undefined = undefined;

    if (callback) {
      mkSimplex = new Simplex();
      mkPoints = mkSimplex.points;
      direction = mkSimplex.direction;
      spSimplex = new Simplex();
      spPoints = spSimplex.points;
    }

    // This normally gets us closest to the origin.
    // direction = shapeA.position.subO(shapeB.position, direction);
    //* This normally gets us furthest from the origin.
    //* Use it because swapping mka and mkb is faster than getting support when not colliding.
    direction = shapeB.position.subO(shapeA.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    let mka = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mka.adjustDiffPointIfCircle();
    let a = mka.worldPoint;

    if (callback) {
      mkPoints!.push(mka.clone());
      direction = mkSimplex!.direction;
      const mkai = new MinkowskiDiffIterator(mka);
      spPoints!.push(new SupportPointImpl(mkai.shape, undefined, mkai.getShapeEdge().worldStart));
      callback([mkSimplex!.clone(), spSimplex!.clone()]);
    }

    direction.negate();

    if (a.dot(direction) > 0) return false; // a is in front of origin in direction.

    let mkb = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mkb.adjustDiffPointIfCircle();
    let b = mkb.worldPoint;

    if (callback) {
      mkPoints!.push(mkb.clone());
      let mkbi = new MinkowskiDiffIterator(mkb);
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.getShapeEdge().worldStart));
      callback([mkSimplex!.clone(), spSimplex!.clone()]);
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
        mkPoints!.shift();
        mkPoints!.push(mkb.clone());
        const mkbi = new MinkowskiDiffIterator(mkb);
        spPoints!.shift();
        spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.getShapeEdge().worldStart));
        callback([mkSimplex!.clone(), spSimplex!.clone()]);
      }
    }

    state.mkc || (state.mkc = new MinkowskiDiffIterator(mkb));
    const ao = a.negateO();
    const ab = b.subO(a);

    return ao.cross2D(ab) < 0
      ? this.walkCcwProgress(mka, mkb, state.mkc, ao, mkSimplex, spSimplex, callback)
      : this.walkCwProgress(mka, mkb, state.mkc, ao, mkSimplex, spSimplex, callback);
  }

  protected walkCcwProgress(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    mkc: MinkowskiDiffIterator,
    ao: Vector,
    mkSimplex?: Simplex,
    spSimplex?: Simplex,
    callback?: SimplexCallback): boolean | undefined {
    const a = mka.worldPoint;
    const b = mkb.worldPoint.clone();
    let i = mkc.vertexCount;
    let mkPoints: SupportPoint[];
    let spPoints: SupportPoint[];

    mkc.init(mkb);

    if (callback) {
      spPoints = spSimplex!.points;
      const edge = mkc.getShapeEdge();
      spPoints.pop();
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, edge.worldStart));
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, edge.worldEnd));
    }

    mkc.next();
    let c = mkc.worldPoint;

    if (callback) {
      const ab = b.subO(a);
      ab.perpLeftO(mkSimplex!.direction);
      mkPoints = mkSimplex!.points;
      mkPoints.push(mkc.clone());
      callback([mkSimplex!.clone(), spSimplex!.clone()]);
    }

    const ac = c.subO(a);

    while (ao.cross2D(ac) < 0 && i-- > 0) {
      if (callback) {
        const edge = mkc.getShapeEdge();
        spPoints!.pop();
        spPoints!.push(new SupportPointImpl(mkc.shape, undefined, edge.worldStart));
        spPoints!.push(new SupportPointImpl(mkc.shape, undefined, edge.worldEnd));
      }

      b.copyFrom(c);
      mkc.next();
      c = mkc.worldPoint;
      c.subO(a, ac);

      if (callback) {
        mkPoints!.splice(1, 1);
        mkPoints!.push(mkc.clone());
        callback([mkSimplex!.clone(), spSimplex!.clone()]);
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
    mkSimplex?: Simplex,
    spSimplex?: Simplex,
    callback?: SimplexCallback): boolean | undefined {
    const a = mka.worldPoint;
    const b = mkb.worldPoint.clone();
    let i = mkc.vertexCount;
    let mkPoints: SupportPoint[];
    let spPoints: SupportPoint[];

    mkc.init(mkb);
    mkc.prev();
    let c = mkc.worldPoint;

    if (callback) {
      const ab = b.subO(a);
      ab.perpRightO(mkSimplex!.direction);
      mkPoints = mkSimplex!.points;
      mkPoints.push(mkc.clone());
      spPoints = spSimplex!.points;
      const edge = mkc.getShapeEdge();
      spPoints.pop();
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, edge.worldEnd));
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, edge.worldStart));
      callback([mkSimplex!.clone(), spSimplex!.clone()]);
    }

    const ac = c.subO(a);

    while (ao.cross2D(ac) > 0 && i-- > 0) {
      b.copyFrom(c);
      mkc.prev();
      c = mkc.worldPoint;
      c.subO(a, ac);

      if (callback) {
        mkPoints!.splice(1, 1);
        mkPoints!.push(mkc.clone());
        const edge = mkc.getShapeEdge();
        spPoints!.splice(1, 2);
        spPoints!.push(new SupportPointImpl(mkc.shape, undefined, edge.worldEnd));
        spPoints!.push(new SupportPointImpl(mkc.shape, undefined, edge.worldStart));
        callback([mkSimplex!.clone(), spSimplex!.clone()]);
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
