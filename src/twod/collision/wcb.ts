import { ColliderBase, ColliderCallback, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { dir, Vector } from '../../vectors';
import { MinkowskiDiffIterator, MinkowskiPoint, ORIGIN, Simplex, SupportPoint, SupportPointImpl } from '../shapes';
import * as Minkowski from '../shapes/minkowski';
import { CircleSegmentInfo, getCircleSegmentInfo, segmentClosestPoint } from '../utils/utils2d';
import { ContactPoint } from './contact';

const ZERO_DIRECTION = dir(0, 0);

export class WcbState {
  constructor() {
  }

  mkc?: MinkowskiDiffIterator;
  unsupported?: boolean;
}

export class Wcb extends ColliderBase {
  constructor() {
    super();
    this.circleSegments = getCircleSegmentInfo();
  }

  circleSegments: CircleSegmentInfo;

  protected populateContact(contact: Contact, mkc: MinkowskiDiffIterator, containsOrigin: boolean) {
    contact.reset();
    const a = mkc.vertex.clone();
    const b = mkc.nextVertex.clone();
    const referenceEdge = mkc.getShapeEdge();

    while (mkc.shape === referenceEdge.shape)
      mkc.next();

    let incidentLeftEdge = mkc.getShapeEdge();
    const incidentRightEdge = mkc.iterator.prevEdge;
    // let incidentVertex = incidentLeftEdge.worldStart;

    const closestPoint = segmentClosestPoint(a, b, ORIGIN);
    closestPoint.asDirectionO(contact.normal);
    let depth = contact.normal.mag;
    contact.minkowskiNormal = contact.normal.normalizeO();
    contact.minkowskiDepth = Math.abs(depth);
    contact.normal.normalize();

    if (!containsOrigin) {
      depth = -depth;
      referenceEdge.shape === contact.shapeA && contact.normal.negate();
    } else {
      referenceEdge.shape !== contact.shapeA && contact.normal.negate();
    }

    const negativeNormal = contact.normal.negateO();
    const incidentLeftDot = incidentLeftEdge.normalDirection.dot(negativeNormal);
    const incidentRightDot = incidentRightEdge.normalDirection.dot(negativeNormal);
    // Incident edge is the one most in the direction of the normal.
    const incidentEdge = incidentLeftDot > incidentRightDot ? incidentLeftEdge : incidentRightEdge;
    const incidentStartDot = incidentEdge.worldStart.dot(negativeNormal);
    const incidentEndDot = incidentEdge.worldEnd.dot(negativeNormal);
    // Incident vertex is the one most in the direction of the normal.
    const incidentVertex = incidentStartDot > incidentEndDot ? incidentEdge.worldStart : incidentEdge.worldEnd;

    contact.points.push(new ContactPoint(incidentVertex, depth));
    contact.referenceEdge = referenceEdge.clone();
    contact.incidentEdge = incidentEdge.clone();
    return contact;
  }

  protected walkCcwProgress(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    mkc: MinkowskiDiffIterator,
    ao: Vector,
    contact?: Contact,
    mkSimplex?: Simplex,
    spSimplex?: Simplex,
    callback?: ColliderCallback): boolean | Contact | undefined | null {
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
      callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
    }

    const ac = c.subO(a);

    while (ao.cross2D(ac) < 0 && i-- > 0) {
      if (callback) {
        const edge = mkc.getShapeEdge();
        spPoints!.splice(1, 2);
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
        callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
      }
    }

    const bo = b.negateO();
    const bc = c.subO(b);
    const containsOrigin = bo.cross2D(bc) <= 0;

    if (contact) {
      // TODO: Need to walk to the edge that's closest to the origin.
      mkc.prev();
      this.populateContact(contact, mkc, containsOrigin);
      callback && callback({ contact });
      return contact;
    }

    return containsOrigin;
  }

  protected walkCwProgress(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    mkc: MinkowskiDiffIterator,
    ao: Vector,
    contact?: Contact,
    mkSimplex?: Simplex,
    spSimplex?: Simplex,
    callback?: ColliderCallback): boolean | Contact | undefined | null {
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
      callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
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
        callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
      }
    }

    const bo = b.negateO();
    const bc = c.subO(b);
    const containsOrigin = bo.cross2D(bc) >= 0;

    if (contact) {
      // TODO: Need to walk to the edge that's closest to the origin.
      this.populateContact(contact, mkc, containsOrigin);
      callback && callback({ contact });
      return contact;
    }

    return containsOrigin;
  }

  protected walkCcw(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    mkc: MinkowskiDiffIterator,
    ao: Vector,
    contact?: Contact): boolean | Contact | undefined | null {
    const a = mka.worldPoint;
    const b = mkb.worldPoint.clone();
    let i = mkc.vertexCount;

    mkc.init(mkb);
    mkc.next();
    let c = mkc.worldPoint;
    const ac = c.subO(a);

    while (ao.cross2D(ac) < 0 && i-- > 0) {
      b.copyFrom(c);
      mkc.next();
      c = mkc.worldPoint;
      c.subO(a, ac);
    }

    const bo = b.negateO();
    const bc = c.subO(b);
    const containsOrigin = bo.cross2D(bc) <= 0;

    if (contact) {
      // TODO: Need to walk to the edge that's closest to the origin.
      mkc.prev();
      return this.populateContact(contact, mkc, containsOrigin);
    }

    return containsOrigin;
  }

  protected walkCw(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    mkc: MinkowskiDiffIterator,
    ao: Vector,
    contact?: Contact): boolean | Contact | undefined | null {
    const a = mka.worldPoint;
    const b = mkb.worldPoint.clone();
    let i = mkc.vertexCount;

    mkc.init(mkb);
    mkc.prev();
    let c = mkc.worldPoint;
    const ac = c.subO(a);

    while (ao.cross2D(ac) > 0 && i-- > 0) {
      b.copyFrom(c);
      mkc.prev();
      c = mkc.worldPoint;
      c.subO(a, ac);
    }

    const bo = b.negateO();
    const bc = c.subO(b);
    const containsOrigin = bo.cross2D(bc) >= 0;

    // TODO: Need to walk to the edge that's closest to the origin.
    return contact ? this.populateContact(contact, mkc, containsOrigin) : containsOrigin;
  }

  protected calcCollisionCommonProgress(
    shapes: ShapePair,
    contact?: Contact,
    calcDistance: boolean = false,
    callback?: ColliderCallback): boolean | Contact | undefined | null {
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

    if (calcDistance && contact)
      //* This normally gets us furthest from the origin but forces us to get a second support point
      //* when not colliding.
      //* If we have to calc distance, then we have to have a second support point anyway so use this
      //* as it won't require swapping support points.
      direction = shapeA.position.subO(shapeB.position, direction);
    else
      //* This normally gets us closest to the origin and we can early exit without getting another
      //* support point. It requires a swap but only if the shapes are colliding.
      //* Swapping the support points is faster than getting a new support point so use this if
      //* we don't have to calculate distance.
      direction = shapeB.position.subO(shapeA.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    shapeA.usesReferenceShape && (shapeA.referenceShape = shapeB);
    shapeB.usesReferenceShape && (shapeB.referenceShape = shapeA);
    let mka = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mka.adjustDiffPointIfCircle();
    let a = mka.worldPoint;

    if (callback) {
      mkPoints!.push(mka.clone());
      direction = mkSimplex!.direction;
      const mkai = new MinkowskiDiffIterator(mka, this.circleSegments);
      spPoints!.push(new SupportPointImpl(mkai.shape, undefined, mkai.getShapeEdge().worldStart));
      callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
    }

    direction.negate();

    if (!calcDistance && a.dot(direction) > 0) return false; // a is in front of origin in direction.

    let mkb = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mkb.adjustDiffPointIfCircle();
    let b = mkb.worldPoint;

    if (callback) {
      mkPoints!.push(mkb.clone());
      let mkbi = new MinkowskiDiffIterator(mkb, this.circleSegments);
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.getShapeEdge().worldStart));
      callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
    }

    if (!calcDistance && b.dot(direction) <= 0) return false; // b did not cross origin in direction.

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
        const mkbi = new MinkowskiDiffIterator(mkb, this.circleSegments);
        spPoints!.shift();
        spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.getShapeEdge().worldStart));
        callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
      }
    }

    state.mkc || (state.mkc = new MinkowskiDiffIterator(mkb, this.circleSegments));
    const ao = a.negateO();
    const ab = b.subO(a);

    return ao.cross2D(ab) < 0
      ? this.walkCcwProgress(mka, mkb, state.mkc, ao, contact, mkSimplex, spSimplex, callback)
      : this.walkCwProgress(mka, mkb, state.mkc, ao, contact, mkSimplex, spSimplex, callback);
  }

  protected calcCollisionCommon(
    shapes: ShapePair,
    contact?: Contact,
    calcDistance: boolean = false): boolean | Contact | undefined | null {
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;

    const { shapeA, shapeB } = shapes;
    let direction: Vector | undefined = undefined;

    if (calcDistance && contact)
      //* This normally gets us furthest from the origin but forces us to get a second support point
      //* when not colliding.
      //* If we have to calc distance, then we have to have a second support point anyway so use this
      //* as it won't require swapping support points.
      direction = shapeA.position.subO(shapeB.position, direction);
    else
      //* This normally gets us closest to the origin and we can early exit without getting another
      //* support point. It requires a swap but only if the shapes are colliding.
      //* Swapping the support points is faster than getting a new support point so use this if
      //* we don't have to calculate distance.
      direction = shapeB.position.subO(shapeA.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    let mka = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mka.adjustDiffPointIfCircle();
    let a = mka.worldPoint;

    direction.negate();

    if (!calcDistance && a.dot(direction) > 0) return false; // a is in front of origin in direction.

    let mkb = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mkb.adjustDiffPointIfCircle();
    let b = mkb.worldPoint;

    if (!calcDistance && b.dot(direction) <= 0) return false; // b did not cross origin in direction.

    if (a.magSquared < b.magSquared) {
      const temp = mka;
      mka = mkb;
      mkb = temp;

      direction.negate();
      a = mka.worldPoint;
      b = mkb.worldPoint;
    }

    state.mkc || (state.mkc = new MinkowskiDiffIterator(mkb, this.circleSegments));
    const ao = a.negateO();
    const ab = b.subO(a);

    return ao.cross2D(ab) < 0
      ? this.walkCcw(mka, mkb, state.mkc, ao, contact)
      : this.walkCw(mka, mkb, state.mkc, ao, contact);
  }

  isCollidingProgressCore(shapes: ShapePair, callback: ColliderCallback): boolean | undefined {
    const result = this.calcCollisionCommonProgress(shapes, undefined, false, callback);
    return typeof result === "boolean" || result === undefined ? result : undefined;
  }

  calcContactProgressCore(
    shapes: ShapePair,
    callback: ColliderCallback,
    contact: Contact,
    calcDistance: boolean): Tristate<Contact> {
    const result = this.calcCollisionCommonProgress(shapes, contact, calcDistance, callback);
    return result instanceof Contact || result === undefined || result === null ? result : undefined;
  }

  protected isCollidingCore(shapes: ShapePair): boolean | undefined {
    const result = this.calcCollisionCommon(shapes, undefined, false);
    return typeof result === "boolean" || result === undefined ? result : undefined;
  }

  protected calcContactCore(shapes: ShapePair, contact?: Contact, calcDistance?: boolean): Tristate<Contact> {
    const result = this.calcCollisionCommon(shapes, contact, calcDistance);
    return result instanceof Contact || result === undefined || result === null ? result : undefined;
  }

  protected getState(shapes: ShapePair) {
    let state = <WcbState>shapes.customData["wcbState"];

    if (!state) {
      state = new WcbState();
      shapes.customData["wcbState"] = state;
    }

    return state;
  }
}
