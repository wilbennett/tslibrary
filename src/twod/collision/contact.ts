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
  get shapeA(): Shape { return this.shapeA; }
  set shapeA(value) { this.shapeA = value; }
  protected _shapeB: Shape;
  get shapeB(): Shape { return this.shapeB; }
  set shapeB(value) { this.shapeB = value; }
  normal: Vector;
  points: ContactPoint[];
  get isContacting() { return this.points.length > 0 && this.points.some(p => p.isPenetrating); }
  protected _referenceEdge: Tristate<Edge>;
  get referenceEdge() {
    if (this._referenceEdge === undefined)
      this.calcEdgeTypes();

    return this._referenceEdge;
  }
  set referenceEdge(value) { this._referenceEdge = value; }
  protected _incidentEdge: Tristate<Edge>;
  get incidentEdge() {
    if (this._referenceEdge === undefined)
      this.calcEdgeTypes();

    return this._incidentEdge;
  }
  set incidentEdge(value) { this._incidentEdge = value; }
  protected _props?: ContextProps;
  get props() { return this._props || { strokeStyle: "blue", fillStyle: "blue" }; }
  set props(value) { this._props = value; }

  reset() {
    this.normal.withXY(0, 0);
    this._referenceEdge = undefined;
    this._incidentEdge = undefined;
    this.points.splice(0);
  }

  flipNormal() {
    const normal = this.normal;
    this.points.forEach(cp => cp.point.displaceBy(normal.scaleO(cp.depth)));
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

  ensureNormalDirection() {
    if (!this.referenceEdge) return;
    if (this.referenceEdge.shape === this.shapeB) return;

    const temp = this.shapeA;
    this.shapeA = this.shapeB;
    this.shapeB = temp;
  }

  protected calcBestEdge(shape: Shape, direction: Vector) {
    const edges = shape.getFurthestEdges(direction);

    if (edges.length === 0) return null;
    if (edges.length === 1) return edges[0];

    const v0 = edges[0].worldStart;
    const v = edges[0].worldEnd;
    const v1 = edges[1].worldEnd;

    const left = v.subO(v1).normalize();
    const right = v.subO(v0).normalize();

    if (right.dot(direction) <= left.dot(direction))
      return edges[0]; // Right edge is most perpendicular to direction.

    return edges[1];
  }

  protected calcEdgeTypes() {
    const direction = this.normal;
    const edgeA = this.calcBestEdge(this.shapeA, direction);
    const edgeB = this.calcBestEdge(this.shapeB, direction.negateO());

    if (!edgeA || !edgeB) {
      if (this._referenceEdge === undefined)
        this._referenceEdge = null;

      if (this._incidentEdge === undefined)
        this._incidentEdge = null;

      return;
    }

    if (edgeA.normal.dot(direction) <= edgeB.normal.dot(direction)) {
      !this._referenceEdge && (this._referenceEdge = edgeA);
      !this._incidentEdge && (this._incidentEdge = edgeB);
    } else {
      !this._referenceEdge && (this._referenceEdge = edgeB);
      !this._incidentEdge && (this._incidentEdge = edgeA);
    }
  }
}
