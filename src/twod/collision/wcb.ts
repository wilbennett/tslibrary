import { ColliderBase, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { dir, Vector } from '../../vectors';
import {
  Edge,
  MinkowskiDiffIterator,
  MinkowskiPoint,
  Simplex,
  SimplexCallback,
  SupportPoint,
  SupportPointImpl,
} from '../shapes';
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

  isCollidingProgress(shapes: ShapePair, callback?: SimplexCallback): boolean | undefined {
    const result = this.calcCollisionCommonProgress(shapes, undefined, false, callback);
    return typeof result === "boolean" || result === undefined ? result : undefined;
  }

  calcContactProgress(
    shapes: ShapePair,
    contact?: Contact,
    calcDistance: boolean = false,
    callback?: SimplexCallback): Tristate<Contact> {
    const result = this.calcCollisionCommonProgress(shapes, contact, calcDistance, callback);
    return result instanceof Contact || result === undefined || result === null ? result : undefined;
  }

  protected getBestEdge(direction: Vector, leftEdge: Edge, rightEdge: Edge) {
    const v0 = rightEdge.worldStart;
    const v = rightEdge.worldEnd;
    const v1 = leftEdge.worldEnd;

    const left = v.subO(v1).normalize();
    const right = v.subO(v0).normalize();

    if (right.dot(direction) <= left.dot(direction))
      return rightEdge; // Right edge is most perpendicular to direction.

    return leftEdge;
  }

  protected populateContact(contact: Contact, mkc: MinkowskiDiffIterator, containsOrigin: boolean) {
    contact.reset();
    const refLeftEdge = mkc.getShapeEdge();
    const refRightEdge = mkc.iterator.prevEdge;

    while (mkc.shape === refLeftEdge.shape)
      mkc.next();

    let incLeftEdge = mkc.getShapeEdge();
    let incidentVertex = incLeftEdge.worldStart;

    const closestPoint = segmentClosestPoint(refLeftEdge.worldStart, refLeftEdge.worldEnd, incidentVertex);
    closestPoint.subO(incidentVertex, contact.normal);
    const depth = containsOrigin ? contact.normal.mag : -contact.normal.mag;
    !containsOrigin && contact.normal.negate();

    contact.points.push(new ContactPoint(incidentVertex, depth));
    contact.normal.normalize();

    if (!containsOrigin || contact.shapeA.vertexList.length < 2 || contact.shapeB.vertexList.length < 2) {
      contact.referenceEdge = refLeftEdge.clone();
      contact.incidentEdge = incLeftEdge.clone();
      return contact;
    }

    refLeftEdge.shape === contact.shapeB && contact.normal.negate();
    const incRightEdge = mkc.iterator.prevEdge;
    let collisionNormal = contact.normal.clone();
    let referenceEdge: Edge;
    let incidentEdge: Edge;

    if (refLeftEdge.shape === contact.shapeA) {
      referenceEdge = this.getBestEdge(collisionNormal, refLeftEdge, refRightEdge);
      incidentEdge = this.getBestEdge(collisionNormal.negateO(), incLeftEdge, incRightEdge);
    } else { // Always start with reference on shapeA.
      referenceEdge = this.getBestEdge(collisionNormal, incLeftEdge, incRightEdge);
      incidentEdge = this.getBestEdge(collisionNormal.negateO(), refLeftEdge, refRightEdge);
    }

    const refVector = referenceEdge.worldEnd.subO(referenceEdge.worldStart);
    const incVector = incidentEdge.worldEnd.subO(incidentEdge.worldStart);

    const refDotNormal = Math.abs(refVector.dot(collisionNormal));
    const incDotNormal = Math.abs(incVector.dot(collisionNormal));

    if (refDotNormal <= incDotNormal) { // Reference is most perpendicular to the normal.
      contact.referenceEdge = referenceEdge.clone();
      contact.incidentEdge = incidentEdge.clone();
    } else {
      contact.referenceEdge = incidentEdge.clone();
      contact.incidentEdge = referenceEdge.clone();
      contact.flip = true;
    }

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
    callback?: SimplexCallback): boolean | Contact | undefined | null {
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
    callback?: SimplexCallback): boolean | Contact | undefined | null {
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

    return contact ? this.populateContact(contact, mkc, containsOrigin) : containsOrigin;
  }

  protected calcCollisionCommonProgress(
    shapes: ShapePair,
    contact?: Contact,
    calcDistance: boolean = false,
    callback?: SimplexCallback): boolean | Contact | undefined | null {
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
