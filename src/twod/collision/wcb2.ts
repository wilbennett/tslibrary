import { ColliderBase, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { dir, pos, Vector } from '../../vectors';
import { MinkowskiDiffIterator, Simplex, SimplexCallback, SupportPoint, SupportPointImpl } from '../shapes';
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
const ORIGIN = pos(0, 0);

export class Wcb2State {
  constructor() {
  }

  mkc?: MinkowskiDiffIterator;
  unsupported?: boolean;
}

export class Wcb2 extends ColliderBase {
  constructor() {
    super();
    this.circleSegments = getCircleSegmentInfo();
  }

  circleSegments: CircleSegmentInfo;

  isCollidingProgress(shapes: ShapePair, callback?: SimplexCallback): boolean | undefined {
    const result = this.calcCollisionCommonProgress(shapes, callback, undefined, false);
    return typeof result === "boolean" || result === undefined ? result : undefined;
  }

  calcContactProgress(
    shapes: ShapePair,
    contact: Contact,
    calcDistance: boolean = false,
    callback: SimplexCallback): Tristate<Contact> {
    const result = this.calcCollisionCommonProgress(shapes, callback, contact, calcDistance);
    return result instanceof Contact || result === undefined || result === null ? result : undefined;
  }

  protected populateContact(contact: Contact, mkbi: MinkowskiDiffIterator, containsOrigin: boolean) {
    const a = mkbi.vertex.clone();
    const b = mkbi.nextVertex.clone();
    const referenceEdge = mkbi.getShapeEdge();

    while (mkbi.shape === referenceEdge.shape)
      mkbi.next();

    const incidentLeftEdge = mkbi.getShapeEdge();
    const incidentRightEdge = mkbi.iterator.prevEdge;

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

  protected walkCcwProgress(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
    mkSimplex?: Simplex,
    spSimplex?: Simplex,
    callback?: SimplexCallback,
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

    if (contact) {
      spPoints!.splice(0);
      const edge = mkbi.getShapeEdge();
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, edge.worldStart));
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, edge.worldEnd));
      callback!({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
    }

    const ao = a.negateO();
    const ab = b.subO(a);
    const containsOrigin = ab.cross2D(ao) >= 0;

    if (contact) {
      this.populateContact(contact, mkbi, containsOrigin);
      callback && callback({ contact });
      return contact;
    }

    return containsOrigin;
  }

  protected walkCwProgress(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
    mkSimplex?: Simplex,
    spSimplex?: Simplex,
    callback?: SimplexCallback,
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

    const ao = a.negateO();
    const ab = b.subO(a);
    const containsOrigin = ab.cross2D(ao) >= 0;

    if (contact) {
      this.populateContact(contact, mkbi, containsOrigin);
      callback && callback({ contact });
      return contact;
    }

    return containsOrigin;
  }

  protected walkCcw(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
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

    const ao = a.negateO();
    const ab = b.subO(a);
    const containsOrigin = ab.cross2D(ao) >= 0;

    return contact ? this.populateContact(contact, mkbi, containsOrigin) : containsOrigin;
  }

  protected walkCw(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
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

    const ao = a.negateO();
    const ab = b.subO(a);
    const containsOrigin = ab.cross2D(ao) >= 0;

    return contact ? this.populateContact(contact, mkbi, containsOrigin) : containsOrigin;
  }

  protected calcCollisionCommonProgress(
    shapes: ShapePair,
    callback?: SimplexCallback,
    contact?: Contact,
    calcDistance: boolean = false): boolean | Contact | undefined | null {
    const state = this.getState(shapes);
    contact && contact.reset();

    if (state.unsupported) return undefined;

    const { shapeA, shapeB } = shapes;

    if (shapeA.usesReferenceShape && shapeB.usesReferenceShape) return undefined;

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

    direction = shapeB.position.subO(shapeA.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    shapeA.usesReferenceShape && (shapeA.referenceShape = shapeB);
    shapeB.usesReferenceShape && (shapeB.referenceShape = shapeA);
    let mka = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mka.adjustDiffPointIfCircle();
    const mkbi = new MinkowskiDiffIterator(mka, this.circleSegments);
    let b = mka.worldPoint;

    if (callback) {
      mkPoints!.push(mka.clone());
      mkSimplex!.direction.copyFrom(direction);
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.getShapeEdge().worldStart));
      callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
    }

    if (!calcDistance && b.dot(direction) < 0) return false; // b is behind origin in direction.

    // TODO: Since a and c can be more than one vertex from b, these need to be iterators.
    //* Only seems to happen with planes so skipping for now.
    let a = mkbi.prevVertex;
    let c = mkbi.nextVertex;

    if (callback) {
      mkSimplex!.direction.withXY(0, 0);
      mkPoints!.unshift(new SupportPointImpl(mkbi.shape, undefined, a));
      mkPoints!.push(new SupportPointImpl(mkbi.shape, undefined, c));
      mkbi.prev();
      spPoints!.unshift(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
      mkbi.next();
      spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.nextVertex));
      callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
    }

    if (a.equals(b)) {
      mkbi.prev();
      a = mkbi.prevVertex;

      if (callback) {
        mkPoints!.shift();
        spPoints!.shift();
        mkbi.prev();
        mkPoints!.unshift(new SupportPointImpl(mkbi.shape, undefined, a));
        spPoints!.unshift(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
        mkbi.next();
        callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
      }

      mkbi.next();
    }

    if (c.equals(b) || c.equals(a)) {
      mkbi.next();
      c = mkbi.nextVertex;

      if (callback) {
        mkPoints!.pop();
        spPoints!.pop();
        mkbi.next();
        mkPoints!.push(new SupportPointImpl(mkbi.shape, undefined, c));
        spPoints!.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
        mkbi.prev();
        callback({ simplices: [mkSimplex!.clone(), spSimplex!.clone()] });
      }

      mkbi.prev();
    }

    const dista = a.magSquared;
    const distc = c.magSquared;

    return distc <= dista
      ? this.walkCcwProgress(a, mkbi, c, mkSimplex, spSimplex, callback, contact)
      : this.walkCwProgress(a, mkbi, c, mkSimplex, spSimplex, callback, contact);
  }

  protected calcCollisionCommon(
    shapes: ShapePair,
    contact?: Contact,
    calcDistance: boolean = false): boolean | Contact | undefined | null {
    const state = this.getState(shapes);
    contact && contact.reset();

    if (state.unsupported) return undefined;

    const { shapeA, shapeB } = shapes;
    let direction: Vector | undefined = undefined;

    direction = shapeB.position.subO(shapeA.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    let mka = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mka.adjustDiffPointIfCircle();
    const mkai = new MinkowskiDiffIterator(mka, this.circleSegments);

    if (!calcDistance && mka.worldPoint.dot(direction) < 0) return false; // a is behind origin in direction.

    const prev = mkai.prevVertex;
    const next = mkai.nextVertex;
    const distPrev = prev.magSquared;
    const distNext = next.magSquared;

    return distNext <= distPrev
      ? this.walkCcw(prev, mkai, next, contact)
      : this.walkCw(prev, mkai, next, contact);
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
    let state = <Wcb2State>shapes.customData["wcb2State"];

    if (!state) {
      state = new Wcb2State();
      shapes.customData["wcb2State"] = state;
    }

    return state;
  }
}
