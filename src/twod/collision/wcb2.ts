import { ColliderBase, ColliderCallback, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { dir, pos, Vector } from '../../vectors';
import { MinkowskiDiffIterator, Simplex, SupportPoint, SupportPointImpl } from '../shapes';
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

    const incidentLeftDot = incidentLeftEdge.normal.dot(negativeNormal);
    const incidentRightDot = incidentRightEdge.normal.dot(negativeNormal);
    // Incident edge is the one most in the direction of the normal.
    const incidentEdge = incidentLeftDot > incidentRightDot ? incidentLeftEdge : incidentRightEdge;
    const incidentStartDot = incidentEdge.start.dot(negativeNormal);
    const incidentEndDot = incidentEdge.end.dot(negativeNormal);
    // Incident vertex is the one most in the direction of the normal.
    let incidentVertex: Vector;

    if (containsOrigin) {
      contact.normal = normal;
      incidentVertex = incidentStartDot > incidentEndDot ? incidentEdge.start : incidentEdge.end;
    } else {
      const referenceClosest = pos(0, 0);
      const incidentClosest = pos(0, 0);

      depth = segmentSegmentClosestPoints(
        incidentEdge.start,
        incidentEdge.end,
        referenceEdge.start,
        referenceEdge.end,
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
    callback!({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    const ao = a.negateO();
    const ab = b.subO(a);
    const containsOrigin = ab.cross2D(ao) >= 0;

    if (!contact) return containsOrigin;

    this.populateContact(contact, mkbi, containsOrigin);
    callback && callback({ contact });
    return contact;
  }

  protected walkCwProgress(
    a: Vector,
    mkbi: MinkowskiDiffIterator,
    c: Vector,
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

    const ao = a.negateO();
    const ab = b.subO(a);
    const containsOrigin = ab.cross2D(ao) >= 0;

    if (!contact) return containsOrigin;

    this.populateContact(contact, mkbi, containsOrigin);
    callback({ contact });
    return contact;
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

    shapeB.position.subO(shapeA.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    shapeA.usesReferenceShape && (shapeA.referenceShape = shapeB);
    shapeB.usesReferenceShape && (shapeB.referenceShape = shapeA);
    let mka = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mka.adjustDiffPointIfCircle();
    const mkbi = new MinkowskiDiffIterator(mka, this.circleSegments);
    let b = mka.worldPoint;

    mkPoints.push(mka.clone());
    spPoints.push(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
    callback({ simplices: [mkSimplex.clone(), spSimplex.clone()] });

    if (!calcDistance && b.dot(direction) < 0) return false; // b is behind origin in direction.

    // TODO: Since a and c can be more than one vertex from b, these need to be iterators.
    //* Only seems to happen with planes so skipping for now.
    let a = mkbi.prevVertex;
    let c = mkbi.nextVertex;

    mkSimplex.direction.withXY(0, 0);
    mkPoints.unshift(new SupportPointImpl(mkbi.shape, undefined, a));
    mkPoints.push(new SupportPointImpl(mkbi.shape, undefined, c));
    mkbi.prev();
    spPoints.unshift(new SupportPointImpl(mkbi.shape, undefined, mkbi.iterator.vertex));
    mkbi.next();
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
      ? this.walkCcwProgress(a, mkbi, c, mkSimplex, spSimplex, callback, contact)
      : this.walkCwProgress(a, mkbi, c, mkSimplex, spSimplex, callback, contact);
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

    shapeB.position.subO(shapeA.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    shapeA.usesReferenceShape && (shapeA.referenceShape = shapeB);
    shapeB.usesReferenceShape && (shapeB.referenceShape = shapeA);
    let mka = Minkowski.getDiffPoint(shapeA, shapeB, direction);
    mka.adjustDiffPointIfCircle();
    const mkbi = new MinkowskiDiffIterator(mka, this.circleSegments);
    let b = mka.worldPoint;

    if (!calcDistance && b.dot(direction) < 0) return false; // b is behind origin in direction.

    // TODO: Since a and c can be more than one vertex from b, these need to be iterators.
    //* Only seems to happen with planes so skipping for now.
    let a = mkbi.prevVertex;
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
      ? this.walkCcw(a, mkbi, c, contact)
      : this.walkCw(a, mkbi, c, contact);
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
    const result = this.calcCollisionCommon(shapes);
    return typeof result === "boolean" || result === undefined ? result : undefined;
  }

  protected calcContactCore(shapes: ShapePair, contact: Contact, calcDistance: boolean): Tristate<Contact> {
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
