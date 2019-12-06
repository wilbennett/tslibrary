import { ColliderBase, ColliderCallback, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { dir, Vector } from '../../vectors';
import { MinkowskiDiffIterator, MinkowskiPoint, ORIGIN, Simplex, SupportPoint, SupportPointImpl } from '../shapes';
import * as Minkowski from '../shapes/minkowski';
import { CircleSegmentInfo, getCircleSegmentInfo, segmentClosestPoint, segmentSqrDistToPoint } from '../utils/utils2d';
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

  protected scanCcwProgress(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
    containsOrigin: boolean,
    mkSimplex?: Simplex,
    spSimplex?: Simplex,
    callback?: ColliderCallback,
    contact?: Contact): boolean | Contact | undefined | null {
    let mkPoints: SupportPoint[] | null = null;
    let spPoints: SupportPoint[] | null = null;
    let b = mkbi.vertex.clone();
    let distb = b.magSquared;
    let distc = c.magSquared;

    if (callback) {
      mkPoints = mkSimplex!.points;
      spPoints = spSimplex!.points;
    }

    while (distc < distb) {
      mkbi.next();
      a = b;
      b = c;
      c = mkbi.nextVertex;
      distb = distc;
      distc = c.magSquared;

      if (callback) {
        mkPoints!.shift();
        mkPoints!.push(new SupportPointImpl(mkbi.shape, undefined, c));
        spPoints!.shift();
        spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.nextVertex));
        callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
      }
    }

    const abDist = segmentSqrDistToPoint(a, b, ORIGIN);
    const bcDist = segmentSqrDistToPoint(b, c, ORIGIN);

    if (abDist < bcDist) {
      mkbi.prev();
      mkPoints && mkPoints.pop();
    } else {
      a = b;
      b = c;
      mkPoints && mkPoints.shift();
    }

    if (callback) {
      spPoints!.splice(0);
      const edge = mkbi.getShapeEdge();
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, edge.worldStart));
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, edge.worldEnd));
      callback!({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
    }

    if (!contact) return containsOrigin;

    this.populateContact(contact, mkbi, containsOrigin);
    callback && callback({ contact });
    return contact;
  }

  protected scanCwProgress(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
    containsOrigin: boolean,
    mkSimplex?: Simplex,
    spSimplex?: Simplex,
    callback?: ColliderCallback,
    contact?: Contact): boolean | Contact | undefined | null {
    let mkPoints: SupportPoint[] | null = null;
    let spPoints: SupportPoint[] | null = null;
    let b = mkbi.vertex.clone();
    let dista = a.magSquared;
    let distb = b.magSquared;

    if (callback) {
      mkPoints = mkSimplex!.points;
      spPoints = spSimplex!.points;
    }

    while (dista < distb) {
      mkbi.prev();
      c = b;
      b = a;
      a = mkbi.prevVertex;
      distb = dista;
      dista = a.magSquared;

      if (callback) {
        mkPoints!.pop();
        mkPoints!.unshift(new SupportPointImpl(mkbi.shape, undefined, a));
        spPoints!.pop();
        mkbi.prev();
        spPoints!.unshift(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
        mkbi.next();
        callback!({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
      }
    }

    const abDist = segmentSqrDistToPoint(a, b, ORIGIN);
    const bcDist = segmentSqrDistToPoint(b, c, ORIGIN);

    if (abDist < bcDist) {
      mkbi.prev();
      mkPoints && mkPoints.pop();
    } else {
      a = b;
      b = c;
      mkPoints && mkPoints.shift();
    }

    if (callback) {
      spPoints!.splice(0);
      const edge = mkbi.getShapeEdge();
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, edge.worldStart));
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, edge.worldEnd));
      callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
    }

    if (!contact) return containsOrigin;

    this.populateContact(contact, mkbi, containsOrigin);
    callback && callback({ contact });
    return contact;
  }

  protected scanToClosestEdgeProgress(
    mkbi: MinkowskiDiffIterator,
    contact: Contact,
    containsOrigin: boolean,
    mkSimplex: Simplex,
    spSimplex: Simplex,
    callback: ColliderCallback) {
    this.populateContact(contact, mkbi, containsOrigin);
    callback && callback({ contact });
    return contact;
  }

  protected walkCcwProgress(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    mkc: MinkowskiDiffIterator,
    ao: Vector,
    mkSimplex: Simplex,
    spSimplex: Simplex,
    callback: ColliderCallback,
    contact?: Contact): boolean | Contact | undefined | null {
    const a = mka.worldPoint;
    const b = mkb.worldPoint.clone();
    let i = mkc.vertexCount;
    const mkPoints: SupportPoint[] = mkSimplex.points;
    const spPoints: SupportPoint[] = spSimplex.points;

    mkc.init(mkb);

    const edge = mkc.getShapeEdge();
    spPoints.pop();
    spPoints.push(new SupportPointImpl(mkc.shape, undefined, edge.worldStart));
    spPoints.push(new SupportPointImpl(mkc.shape, undefined, edge.worldEnd));

    mkc.next();
    let c = mkc.worldPoint;

    const ab = b.subO(a);
    ab.perpLeftO(mkSimplex.direction);
    mkPoints.push(mkc.clone());
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    const ac = c.subO(a);

    while (ao.cross2D(ac) < 0 && i-- > 0) {
      const edge = mkc.getShapeEdge();
      spPoints.splice(1, 2);
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, edge.worldStart));
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, edge.worldEnd));

      b.copyFrom(c);
      mkc.next();
      c = mkc.worldPoint;
      c.subO(a, ac);

      mkPoints.splice(1, 1);
      mkPoints.push(mkc.clone());
      callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });
    }

    const bo = b.negateO();
    const bc = c.subO(b);
    const containsOrigin = bo.cross2D(bc) <= 0;

    if (!contact) return containsOrigin;

    // TODO: Need to walk to the edge that's closest to the origin.
    mkc.prev();
    return this.scanToClosestEdgeProgress(mkc, contact, containsOrigin, mkSimplex, spSimplex, callback);
    // this.populateContact(contact, mkc, containsOrigin);
    // callback && callback({ contact });
    // return contact;
  }

  protected walkCwProgress(
    mka: MinkowskiPoint,
    mkb: MinkowskiPoint,
    mkc: MinkowskiDiffIterator,
    ao: Vector,
    mkSimplex: Simplex,
    spSimplex: Simplex,
    callback: ColliderCallback,
    contact?: Contact): boolean | Contact | undefined | null {
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

    if (!contact) return containsOrigin;

    // TODO: Need to walk to the edge that's closest to the origin.
    return this.scanToClosestEdgeProgress(mkc, contact, containsOrigin, mkSimplex, spSimplex, callback);
    // this.populateContact(contact, mkc, containsOrigin);
    // callback && callback({ contact });
    // return contact;
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
    callback: ColliderCallback,
    contact?: Contact,
    calcDistance: boolean = false): boolean | Contact | undefined | null {
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;

    const { shapeA, shapeB } = shapes;
    const mkSimplex = new Simplex();
    const spSimplex = new Simplex();
    const mkPoints: SupportPoint[] = mkSimplex.points;
    const spPoints: SupportPoint[] = spSimplex.points;
    const direction: Vector = mkSimplex.direction;

    if (calcDistance && contact)
      //* This normally gets us furthest from the origin but forces us to get a second support point
      //* when not colliding.
      //* If we have to calc distance, then we have to have a second support point anyway so use this
      //* as it won't require swapping support points.
      shapeA.position.subO(shapeB.position, direction);
    else
      //* This normally gets us closest to the origin and we can early exit without getting another
      //* support point. It requires a swap but only if the shapes are colliding.
      //* Swapping the support points is faster than getting a new support point so use this if
      //* we don't have to calculate distance.
      shapeB.position.subO(shapeA.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    shapeA.usesReferenceShape && (shapeA.referenceShape = shapeB);
    shapeB.usesReferenceShape && (shapeB.referenceShape = shapeA);
    let mka = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mka.adjustDiffPointIfCircle();
    let a = mka.worldPoint;

    mkPoints.push(mka.clone());
    const mkai = new MinkowskiDiffIterator(mka, this.circleSegments);
    spPoints.push(new SupportPointImpl(mkai.shape, undefined, mkai.getShapeEdge().worldStart));
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    direction.negate();

    if (!calcDistance && a.dot(direction) > 0) return false; // a is in front of origin in direction.

    let mkb = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mkb.adjustDiffPointIfCircle();
    let b = mkb.worldPoint;

    mkPoints.push(mkb.clone());
    let mkbi = new MinkowskiDiffIterator(mkb, this.circleSegments);
    spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.getShapeEdge().worldStart));
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    if (!calcDistance && b.dot(direction) <= 0) return false; // b did not cross origin in direction.

    if (a.magSquared < b.magSquared) {
      const temp = mka;
      mka = mkb;
      mkb = temp;

      direction.negate();
      a = mka.worldPoint;
      b = mkb.worldPoint;

      mkPoints.shift();
      mkPoints.push(mkb.clone());
      const mkbi = new MinkowskiDiffIterator(mkb, this.circleSegments);
      spPoints.shift();
      spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.getShapeEdge().worldStart));
      callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });
    }

    state.mkc || (state.mkc = new MinkowskiDiffIterator(mkb, this.circleSegments));
    const ao = a.negateO();
    const ab = b.subO(a);

    return ao.cross2D(ab) < 0
      ? this.walkCcwProgress(mka, mkb, state.mkc, ao, mkSimplex, spSimplex, callback, contact)
      : this.walkCwProgress(mka, mkb, state.mkc, ao, mkSimplex, spSimplex, callback, contact);
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
    const result = this.calcCollisionCommonProgress(shapes, callback);
    return typeof result === "boolean" || result === undefined ? result : undefined;
  }

  calcContactProgressCore(
    shapes: ShapePair,
    callback: ColliderCallback,
    contact: Contact,
    calcDistance: boolean): Tristate<Contact> {
    const result = this.calcCollisionCommonProgress(shapes, callback, contact, calcDistance);
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
