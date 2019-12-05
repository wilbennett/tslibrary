import { ColliderBase, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { dir, pos, Vector } from '../../vectors';
import { Edge, MinkowskiDiffIterator, Simplex, SimplexCallback, SupportPoint, SupportPointImpl } from '../shapes';
import * as Minkowski from '../shapes/minkowski';
import { CircleSegmentInfo, getCircleSegmentInfo, segmentClosestPoint, segmentSqrDistToPoint } from '../utils/utils2d';
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

  protected populateContact(contact: Contact, mkbi: MinkowskiDiffIterator, containsOrigin: boolean) {
    const refLeftEdge = mkbi.getShapeEdge();
    const refRightEdge = mkbi.iterator.prevEdge;

    while (mkbi.shape === refLeftEdge.shape)
      mkbi.next();

    let incLeftEdge = mkbi.getShapeEdge();
    let incidentVertex = incLeftEdge.worldStart;

    const closestPoint = segmentClosestPoint(refLeftEdge.worldStart, refLeftEdge.worldEnd, incidentVertex);
    closestPoint.subO(incidentVertex, contact.normal);
    const depth = containsOrigin ? contact.normal.mag : -contact.normal.mag;
    !containsOrigin && contact.normal.negate();

    contact.normal.normalize();

    // if (!containsOrigin) { // || contact.shapeA.vertexList.length < 2 || contact.shapeB.vertexList.length < 2) {
    //   contact.points.push(new ContactPoint(incLeftEdge.worldStart, depth));
    //   contact.referenceEdge = refLeftEdge;
    //   contact.incidentEdge = incLeftEdge;
    //   return contact;
    // }

    contact.points.push(new ContactPoint(incidentVertex, depth));
    refLeftEdge.shape === contact.shapeB && contact.normal.negate();
    const incRightEdge = mkbi.iterator.prevEdge;
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
      contact.referenceEdge = referenceEdge;
      contact.incidentEdge = incidentEdge;
    } else {
      contact.referenceEdge = incidentEdge;
      contact.incidentEdge = referenceEdge;
      contact.flip = true;
    }

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
