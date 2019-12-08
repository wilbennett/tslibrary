import { ClipCallback, Clipper, ShapePair } from '.';
import { ContextProps, Viewport } from '..';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';
import { Edge, Shape } from '../shapes';

export class ContactPoint {
  constructor(
    public point: Vector, // World.
    public depth: number) {
  }

  get isPenetrating() { return this.depth > 0; }

  clone(result?: ContactPoint): ContactPoint {
    if (!result) return new ContactPoint(this.point, this.depth);

    result.point = this.point;
    result.depth = this.depth;
    return result;
  }

  toString() { return `${this.point}, depth: ${this.depth}`; }
};

// TODO: Add Contact ID.
export class Contact {
  constructor(public shapes: ShapePair) {
    this._shapeA = shapes.shapeA;
    this._shapeB = shapes.shapeB;
    this._normal = Vector.direction(0, 0);
    this._negativeNormal = Vector.direction(0, 0);
    this.points = [];
  }

  protected _shapeA: Shape;
  get shapeA(): Shape { return this._shapeA; }
  set shapeA(value) { this._shapeA = value; }
  protected _shapeB: Shape;
  get shapeB(): Shape { return this._shapeB; }
  set shapeB(value) { this._shapeB = value; }
  protected _normal: Vector;
  get normal() { return this._normal; }
  set normal(value) {
    this._normal.withXY(value.x, value.y);
    this._normal.negateO(this._negativeNormal);
    this._isNormalAtoB = undefined;
  }
  protected _negativeNormal: Vector;
  get negativeNormal() { return this._negativeNormal; }
  set negativeNormal(value) {
    this._negativeNormal.withXY(value.x, value.y);
    this._negativeNormal.negateO(this._normal);
    this._isNormalAtoB = undefined;
  }
  get normalAB() { return this.isNormalAtoB ? this._normal : this._negativeNormal; }
  get negativeNormalAB() { return this.isNormalAtoB ? this._negativeNormal : this._normal; }
  points: ContactPoint[];
  minkowskiNormal?: Vector;
  minkowskiDepth?: number;
  protected _isNormalAtoB?: boolean;
  get isNormalAtoB() {
    if (this._isNormalAtoB === undefined) {
      const ab = this.shapeB.position.subO(this.shapeA.position);
      this._isNormalAtoB = ab.dot(this._normal) >= 0;
    }

    return this._isNormalAtoB;
  }
  get isCollision() { return this.points.length > 0 && this.points.some(p => p.isPenetrating); }
  protected _referenceEdge: Tristate<Edge>;
  get referenceEdge() {
    if (this._referenceEdge === undefined)
      this.calcEdgeTypes();

    return this._referenceEdge;
  }
  set referenceEdge(value) { this._referenceEdge = value; }
  protected _incidentEdge: Tristate<Edge>;
  get incidentEdge() {
    if (this._incidentEdge === undefined)
      this.calcEdgeTypes();

    return this._incidentEdge;
  }
  set incidentEdge(value) { this._incidentEdge = value; }
  get canClip() { return this.shapeA.kind !== "circle" && this.shapeB.kind !== "circle"; }
  protected _props?: ContextProps;
  get props() { return this._props || { strokeStyle: "blue", fillStyle: "blue" }; }
  set props(value) { this._props = value; }

  reset() {
    this._normal.withXY(0, 0);
    this._negativeNormal.withXY(0, 0);
    this._isNormalAtoB && (this._isNormalAtoB = false);
    this._referenceEdge !== undefined && (this._referenceEdge = undefined);
    this._incidentEdge !== undefined && (this._incidentEdge = undefined);
    this.minkowskiNormal !== undefined && (this.minkowskiNormal = undefined);
    this.minkowskiDepth !== undefined && (this.minkowskiDepth = undefined);
    this.points.splice(0);
  }

  clone(result?: Contact) {
    result || (result = new Contact(this.shapes));

    result.shapes = this.shapes;
    result.shapeA = this.shapeA;
    result.shapeB = this.shapeB;
    result._normal.copyFrom(this._normal);
    result._negativeNormal.copyFrom(this._negativeNormal);
    result.points.splice(0);
    result.points.push(...this.points.map(p => p.clone()));
    this._referenceEdge && (result._referenceEdge = this._referenceEdge.clone());
    this._incidentEdge && (result._incidentEdge = this._incidentEdge.clone());
    this.minkowskiNormal && (result.minkowskiNormal = this.minkowskiNormal.clone());
    this.minkowskiDepth && (result.minkowskiDepth = this.minkowskiDepth);
    return result;
  }

  clipPoints(clipper: Clipper, clipCallback?: ClipCallback) {
    if (!this.canClip) return;
    if (!this.isCollision) return;
    if (!this.referenceEdge || !this.incidentEdge) return;

    return clipper.clip(this, clipCallback);
  }

  flipNormal() { this._normal.negate(); }

  render(view: Viewport) {
    const props = this.props;
    const temp = Vector.create(0, 0);

    this.points.forEach(cp => {
      cp.point.render(view, undefined, props);
      this._normal.scaleO(cp.depth, temp).render(view, cp.point, props);
    });
  }

  protected markEdgesNull() {
    if (this._referenceEdge === undefined)
      this._referenceEdge = null;

    if (this._incidentEdge === undefined)
      this._incidentEdge = null;
  }

  protected calcBestEdge(shape: Shape, direction: Vector) {
    const edges = shape.getFurthestEdges(direction);

    if (edges.length === 0) return null;
    if (edges.length === 1) return edges[0];

    const rightEdge = edges[0];
    const leftEdge = edges[1];

    const v0 = rightEdge.worldStart;
    const v = rightEdge.worldEnd;
    const v1 = leftEdge.worldEnd;

    const left = v.subO(v1).normalize();
    const right = v.subO(v0).normalize();

    if (right.dot(direction) <= left.dot(direction))
      return rightEdge; // Right edge is most perpendicular to direction.

    return leftEdge;
  }

  protected calcEdgeTypes() {
    if (this.shapeA.vertexList.items.length < 2 || this.shapeB.vertexList.items.length < 2)
      return this.markEdgesNull();

    const normal = this._normal;
    let refEdge: Edge | null;
    let incEdge: Edge | null;

    refEdge = this.calcBestEdge(this.shapeA, normal);
    incEdge = this.calcBestEdge(this.shapeB, normal.negateO());

    if (!refEdge || !incEdge) return this.markEdgesNull();

    const refVector = refEdge.worldEnd.subO(refEdge.worldStart);
    const incVector = incEdge.worldEnd.subO(incEdge.worldStart);

    const refDotNormal = Math.abs(refVector.dot(normal));
    const incDotNormal = Math.abs(incVector.dot(normal));

    if (refDotNormal <= incDotNormal) { // Reference is most perpendicular to the normal.
      this._referenceEdge = refEdge;
      this._incidentEdge = incEdge;
      this._isNormalAtoB = true;
    } else {
      this._referenceEdge = incEdge;
      this._incidentEdge = refEdge;
      this._isNormalAtoB = false;
    }
  }
}
