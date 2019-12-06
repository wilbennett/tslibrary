import { ColliderBase, ColliderCallback, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { dir, pos, Vector } from '../../vectors';
import { MinkowskiDiffIterator, MinkowskiPoint, ORIGIN, Simplex, SupportPoint, SupportPointImpl } from '../shapes';
import * as Minkowski from '../shapes/minkowski';
import {
  CircleSegmentInfo,
  getCircleSegmentInfo,
  lineClosestPoint,
  segmentClosestPoint,
  segmentSegmentClosestPoints,
  segmentSqrDistToPoint,
} from '../utils/utils2d';
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

  protected populateContact(contact: Contact, mkbi: MinkowskiDiffIterator, containsOrigin: boolean) {
    const a = mkbi.vertex.clone();
    const b = mkbi.nextVertex.clone();
    const referenceEdge = mkbi.getShapeEdge();

    while (mkbi.shape === referenceEdge.shape)
      mkbi.next();

    const incidentLeftEdge = mkbi.getShapeEdge();
    const incidentRightEdge = mkbi.iterator.prevEdge;

    //! HACK: Using lineClosestPoint since walking CW is not 100% accurate.
    const closestPoint = containsOrigin ? lineClosestPoint(a, b, ORIGIN) : segmentClosestPoint(a, b, ORIGIN);
    let normal = closestPoint.asDirectionO();
    let depth = normal.mag;
    normal.normalize();
    contact.minkowskiNormal = normal.clone();
    contact.minkowskiDepth = Math.abs(depth);
    let negativeNormal = normal;

    if (!containsOrigin) {
      depth = -depth;

      if (referenceEdge.shape === contact.shapeA)
        normal = normal.negateO();
      else
        negativeNormal = normal.negateO();
    } else {
      if (referenceEdge.shape !== contact.shapeA)
        normal = normal.negateO();
      else
        negativeNormal = normal.negateO();
    }

    const incidentLeftDot = incidentLeftEdge.normalDirection.dot(negativeNormal);
    const incidentRightDot = incidentRightEdge.normalDirection.dot(negativeNormal);
    // Incident edge is the one most in the direction of the normal.
    const incidentEdge = incidentLeftDot > incidentRightDot ? incidentLeftEdge : incidentRightEdge;
    const incidentStartDot = incidentEdge.worldStart.dot(negativeNormal);
    const incidentEndDot = incidentEdge.worldEnd.dot(negativeNormal);
    // Incident vertex is the one most in the direction of the normal.
    let incidentVertex: Vector;

    if (containsOrigin) {
      contact.normal = normal;
      incidentVertex = incidentStartDot > incidentEndDot ? incidentEdge.worldStart : incidentEdge.worldEnd;
    } else {
      const referenceClosest = pos(0, 0);
      const incidentClosest = pos(0, 0);

      depth = segmentSegmentClosestPoints(
        incidentEdge.worldStart,
        incidentEdge.worldEnd,
        referenceEdge.worldStart,
        referenceEdge.worldEnd,
        incidentClosest,
        referenceClosest);

      incidentVertex = incidentClosest;
      depth = -Math.sqrt(depth);
      contact.normal = incidentClosest.subO(referenceClosest).normalize();
    }

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
    mkSimplex: Simplex,
    spSimplex: Simplex,
    callback: ColliderCallback,
    contact?: Contact): boolean | Contact | undefined | null {
    const mkPoints: SupportPoint[] = mkSimplex.points;
    const spPoints: SupportPoint[] = spSimplex.points;
    let b = mkbi.vertex.clone();
    let distb = b.magSquared;
    let distc = c.magSquared;

    while (distc < distb) {
      mkbi.next();
      a = b;
      b = c;
      c = mkbi.nextVertex;
      distb = distc;
      distc = c.magSquared;

      mkPoints.shift();
      mkPoints.push(new SupportPointImpl(mkbi.shape, undefined, c));
      spPoints.shift();
      spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.nextVertex));
      callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });
    }

    const abDist = segmentSqrDistToPoint(a, b, ORIGIN);
    const bcDist = segmentSqrDistToPoint(b, c, ORIGIN);

    if (abDist < bcDist) {
      mkbi.prev();
      mkPoints.pop();
    } else {
      a = b;
      b = c;
      mkPoints.shift();
    }

    spPoints.splice(0);
    spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
    spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.nextVertex));
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    if (!contact) return containsOrigin;

    this.populateContact(contact, mkbi, containsOrigin);
    callback({ contact });
    return contact;
  }

  protected scanCwProgress(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
    containsOrigin: boolean,
    mkSimplex: Simplex,
    spSimplex: Simplex,
    callback: ColliderCallback,
    contact?: Contact): boolean | Contact | undefined | null {
    const mkPoints: SupportPoint[] = mkSimplex.points;
    const spPoints: SupportPoint[] = spSimplex.points;
    let b = mkbi.vertex.clone();
    let dista = a.magSquared;
    let distb = b.magSquared;

    while (dista < distb) {
      mkbi.prev();
      c = b;
      b = a;
      a = mkbi.prevVertex;
      distb = dista;
      dista = a.magSquared;

      mkPoints.pop();
      mkPoints.unshift(new SupportPointImpl(mkbi.shape, undefined, a));
      spPoints.pop();
      mkbi.prev();
      spPoints.unshift(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
      mkbi.next();
      callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });
    }

    const abDist = segmentSqrDistToPoint(a, b, ORIGIN);
    const bcDist = segmentSqrDistToPoint(b, c, ORIGIN);

    if (abDist < bcDist) {
      mkbi.prev();
      mkPoints.pop();
    } else {
      a = b;
      b = c;
      mkPoints.shift();
    }

    spPoints.splice(0);
    spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
    spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.nextVertex));
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    if (!contact) return containsOrigin;

    this.populateContact(contact, mkbi, containsOrigin);
    callback({ contact });
    return contact;
  }

  protected scanToClosestEdgeProgress(
    mkbi: MinkowskiDiffIterator,
    contact: Contact,
    containsOrigin: boolean,
    mkSimplex: Simplex,
    spSimplex: Simplex,
    callback: ColliderCallback) {
    const mkPoints: SupportPoint[] = mkSimplex.points;
    const spPoints: SupportPoint[] = spSimplex.points;
    // TODO: Since a and c can be more than one vertex from b, these need to be iterators.
    //* Only seems to happen with planes so skipping for now.
    let a = mkbi.prevVertex;
    let b = mkbi.vertex.clone();
    let c = mkbi.nextVertex;

    mkPoints.splice(0);
    spPoints.splice(0);
    mkSimplex.direction.withXY(0, 0);
    mkPoints.push(new SupportPointImpl(mkbi.shape, undefined, a));
    mkPoints.push(new SupportPointImpl(mkbi.shape, undefined, b));
    mkPoints.push(new SupportPointImpl(mkbi.shape, undefined, c));
    mkbi.prev();
    spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
    mkbi.next();
    spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
    spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.nextVertex));
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    if (a.equals(b)) {
      mkbi.prev();
      a = mkbi.prevVertex;

      mkPoints.shift();
      spPoints.shift();
      mkbi.prev();
      mkPoints.unshift(new SupportPointImpl(mkbi.shape, undefined, a));
      spPoints.unshift(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
      mkbi.next();
      callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

      mkbi.next();
    }

    if (c.equals(b) || c.equals(a)) {
      mkbi.next();
      c = mkbi.nextVertex;

      mkPoints.pop();
      spPoints.pop();
      mkbi.next();
      mkPoints.push(new SupportPointImpl(mkbi.shape, undefined, c));
      spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
      mkbi.prev();
      callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

      mkbi.prev();
    }

    const dista = a.magSquared;
    const distc = c.magSquared;

    return distc <= dista
      ? this.scanCcwProgress(a, mkbi, c, containsOrigin, mkSimplex, spSimplex, callback, contact)
      : this.scanCwProgress(a, mkbi, c, containsOrigin, mkSimplex, spSimplex, callback, contact);
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

    spPoints.pop();
    spPoints.push(new SupportPointImpl(mkc.shape, undefined, mkc.iterator.vertex));
    spPoints.push(new SupportPointImpl(mkc.shape, undefined, mkc.iterator.nextVertex));

    mkc.next();
    let c = mkc.worldPoint;

    const ab = b.subO(a);
    ab.perpLeftO(mkSimplex.direction);
    mkPoints.push(mkc.clone());
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    const ac = c.subO(a);

    while (ao.cross2D(ac) < 0 && i-- > 0) {
      spPoints.splice(1, 2);
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, mkc.iterator.vertex));
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, mkc.iterator.nextVertex));

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

    mkc.prev();
    return this.scanToClosestEdgeProgress(mkc, contact, containsOrigin, mkSimplex, spSimplex, callback);
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
    let mkPoints: SupportPoint[] = mkSimplex.points;
    let spPoints: SupportPoint[] = spSimplex.points;

    mkc.init(mkb);
    mkc.prev();
    let c = mkc.worldPoint;

    const ab = b.subO(a);
    ab.perpRightO(mkSimplex.direction);
    mkPoints = mkSimplex.points;
    mkPoints.push(mkc.clone());
    spPoints = spSimplex.points;
    spPoints.pop();
    spPoints.push(new SupportPointImpl(mkc.shape, undefined, mkc.iterator.vertex));
    spPoints.push(new SupportPointImpl(mkc.shape, undefined, mkc.iterator.nextVertex));
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    const ac = c.subO(a);

    while (ao.cross2D(ac) > 0 && i-- > 0) {
      b.copyFrom(c);
      mkc.prev();
      c = mkc.worldPoint;
      c.subO(a, ac);

      mkPoints.splice(1, 1);
      mkPoints.push(mkc.clone());
      spPoints.splice(1, 2);
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, mkc.iterator.vertex));
      spPoints.push(new SupportPointImpl(mkc.shape, undefined, mkc.iterator.nextVertex));
      callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });
    }

    const bo = b.negateO();
    const bc = c.subO(b);
    const containsOrigin = bo.cross2D(bc) >= 0;

    if (!contact) return containsOrigin;

    return this.scanToClosestEdgeProgress(mkc, contact, containsOrigin, mkSimplex, spSimplex, callback);
  }

  protected scanCcw(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
    containsOrigin: boolean,
    contact?: Contact): boolean | Contact | undefined | null {
    let b = mkbi.vertex.clone();
    let distb = b.magSquared;
    let distc = c.magSquared;

    while (distc < distb) {
      mkbi.next();
      a = b;
      b = c;
      c = mkbi.nextVertex;
      distb = distc;
      distc = c.magSquared;
    }

    const abDist = segmentSqrDistToPoint(a, b, ORIGIN);
    const bcDist = segmentSqrDistToPoint(b, c, ORIGIN);

    if (abDist < bcDist) {
      mkbi.prev();
    } else {
      a = b;
      b = c;
    }

    return contact ? this.populateContact(contact, mkbi, containsOrigin) : containsOrigin;
  }

  protected scanCw(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
    containsOrigin: boolean,
    contact?: Contact): boolean | Contact | undefined | null {
    let b = mkbi.vertex.clone();
    let dista = a.magSquared;
    let distb = b.magSquared;

    while (dista < distb) {
      mkbi.prev();
      c = b;
      b = a;
      a = mkbi.prevVertex;
      distb = dista;
      dista = a.magSquared;
    }

    const abDist = segmentSqrDistToPoint(a, b, ORIGIN);
    const bcDist = segmentSqrDistToPoint(b, c, ORIGIN);

    if (abDist < bcDist) {
      mkbi.prev();
    } else {
      a = b;
      b = c;
    }

    return contact ? this.populateContact(contact, mkbi, containsOrigin) : containsOrigin;
  }

  protected scanToClosestEdge(mkbi: MinkowskiDiffIterator, contact: Contact, containsOrigin: boolean) {
    // TODO: Since a and c can be more than one vertex from b, these need to be iterators.
    //* Only seems to happen with planes so skipping for now.
    let a = mkbi.prevVertex;
    let b = mkbi.vertex.clone();
    let c = mkbi.nextVertex;

    if (a.equals(b)) {
      mkbi.prev();
      a = mkbi.prevVertex;
      mkbi.next();
    }

    if (c.equals(b) || c.equals(a)) {
      mkbi.next();
      c = mkbi.nextVertex;
      mkbi.prev();
    }

    const dista = a.magSquared;
    const distc = c.magSquared;

    return distc <= dista
      ? this.scanCcw(a, mkbi, c, containsOrigin, contact)
      : this.scanCw(a, mkbi, c, containsOrigin, contact);
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

    if (!contact) return containsOrigin;

    mkc.prev();
    return this.scanToClosestEdge(mkc, contact, containsOrigin);
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

    return contact ? this.scanToClosestEdge(mkc, contact, containsOrigin) : containsOrigin;
  }

  protected calcCollisionCommonProgress(
    shapes: ShapePair,
    callback: ColliderCallback,
    contact?: Contact,
    calcDistance: boolean = false): boolean | Contact | undefined | null {
    const { shapeA, shapeB } = shapes;
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;
    if (shapeA.usesReferenceShape && shapeB.usesReferenceShape) return undefined;

    contact && contact.reset();
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
    spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.getShapeEdge().worldStart));
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    if (!calcDistance && b.dot(direction) <= 0) return false; // b did not cross origin in direction.

    if (a.magSquared < b.magSquared) { // Always make b the closest to the origin.
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
    const { shapeA, shapeB } = shapes;
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;
    if (shapeA.usesReferenceShape && shapeB.usesReferenceShape) return undefined;

    contact && contact.reset();
    const direction: Vector = dir(0, 0);

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
    direction.negate();

    if (!calcDistance && a.dot(direction) > 0) return false; // a is in front of origin in direction.

    let mkb = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mkb.adjustDiffPointIfCircle();
    let b = mkb.worldPoint;

    if (!calcDistance && b.dot(direction) <= 0) return false; // b did not cross origin in direction.

    if (a.magSquared < b.magSquared) { // Always make b the closest to the origin.
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
