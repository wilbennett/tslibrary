import { ShapePair } from '.';
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
};

// TODO: Add Contact ID.
export class Contact {
  constructor(public shapes: ShapePair) {
    this._shapeA = shapes.shapeA;
    this._shapeB = shapes.shapeB;
    this.normal = Vector.direction(0, 0);
    this.points = [];
  }

  protected _shapeA: Shape;
  get shapeA(): Shape { return this._shapeA; }
  set shapeA(value) { this._shapeA = value; }
  protected _shapeB: Shape;
  get shapeB(): Shape { return this._shapeB; }
  set shapeB(value) { this._shapeB = value; }
  normal: Vector;
  points: ContactPoint[];
  protected _isNormalToA?: boolean;
  get isNormalToA() { return !!this._isNormalToA; }
  set isNormalToA(value) { this._isNormalToA = value; }
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
  protected _props?: ContextProps;
  get props() { return this._props || { strokeStyle: "blue", fillStyle: "blue" }; }
  set props(value) { this._props = value; }

  reset() {
    this.normal.withXY(0, 0);
    this._isNormalToA && (this._isNormalToA = false);
    this._referenceEdge !== undefined && (this._referenceEdge = undefined);
    this._incidentEdge !== undefined && (this._incidentEdge = undefined);
    this.points.splice(0);
  }

  clone(result?: Contact) {
    result || (result = new Contact(this.shapes));

    result.shapes = this.shapes;
    result.shapeA = this.shapeA;
    result.shapeB = this.shapeB;
    result.normal.copyFrom(this.normal);
    result.points.splice(0);
    result.points.push(...this.points.map(p => p.clone()));
    this._referenceEdge && (result._referenceEdge = this._referenceEdge.clone());
    this._incidentEdge && (result._incidentEdge = this._incidentEdge.clone());
  }

  flipNormal() {
    const normal = this.normal;
    // this.points.forEach(cp => cp.point.displaceBy(normal.scaleO(cp.depth)));
    normal.negate();
  }

  render(view: Viewport) {
    const props = this.props;
    const temp = Vector.create(0, 0);

    this.points.forEach(cp => {
      cp.point.render(view, undefined, props);
      this.normal.scaleO(cp.depth, temp).render(view, cp.point, props);
    });
  }

  swapShapes() {
    const temp = this.shapeA;
    this.shapeA = this.shapeB;
    this.shapeB = temp;
  }

  ensureNormalDirection() {
    if (!this._referenceEdge) return;
    if (this._referenceEdge.shape === this.shapeB) return;

    this.swapShapes();
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

    const direction = this._isNormalToA ? this.normal.negateO() : this.normal;
    let ref: Edge | null;
    let inc: Edge | null;

    ref = this.calcBestEdge(this.shapeA, direction);
    inc = this.calcBestEdge(this.shapeB, direction.negateO());

    if (!ref || !inc) return this.markEdgesNull();

    if (ref.normal.dot(direction) <= inc.normal.dot(direction)) {
      !this._referenceEdge && (this._referenceEdge = ref);
      !this._incidentEdge && (this._incidentEdge = inc);
    } else {
      !this._referenceEdge && (this._referenceEdge = inc);
      !this._incidentEdge && (this._incidentEdge = ref);
    }
  }
}
