import { Body, IBody, IPolygonShape, Mat2, Shape, Vec2 } from '.';
import { MathEx } from '../../../../core';
import { Viewport } from '../../../../twod';
import { pos } from '../../../../vectors';

const MaxPolyVertexCount = 64;

export class PolygonShape implements IPolygonShape {
  constructor() {
    this.radius = 0;
    this.u = new Mat2(0);
  }

  kind: "poly" = "poly";
  _body?: IBody;
  get body(): IBody { return this._body || (this._body = new Body(this, 0, 0)); }
  set body(value) { this._body = value; }
  radius: number;
  u: Mat2;
  vertices: Vec2[] = [];
  normals: Vec2[] = [];

  clone(): Shape {
    const poly = new PolygonShape();
    poly.u = new Mat2(this.u.m00, this.u.m01, this.u.m10, this.u.m11);
    poly.vertices = this.vertices.map(v => new Vec2(v.x, v.y));
    poly.normals = this.normals.map(v => new Vec2(v.x, v.y));
    return poly;
  }

  initialize(): void { this.computeMass(1); }

  computeMass(density: number): void {
    const body = this.body;
    const vertices = this.vertices;
    const vertexCount = vertices.length;

    // Calculate centroid and moment of interia
    let c = new Vec2(0, 0); // centroid
    let area = 0;
    let I = 0;
    const k_inv3 = 1 / 3;

    for (let i1 = 0; i1 < vertexCount; ++i1) {
      const p1 = vertices[i1].clone();
      const i2 = i1 + 1 < vertexCount ? i1 + 1 : 0;
      const p2 = vertices[i2].clone();

      const D = p1.cross(p2);
      const triangleArea = 0.5 * D;

      area += triangleArea;

      c.add(p1.addO(p2).scaleO(triangleArea * k_inv3));

      const intx2 = p1.x * p1.x + p2.x * p1.x + p2.x * p2.x;
      const inty2 = p1.y * p1.y + p2.y * p1.y + p2.y * p2.y;
      I += (0.25 * k_inv3 * D) * (intx2 + inty2);
    }

    c.scale(1 / area);

    for (let i = 0; i < vertexCount; ++i)
      vertices[i].sub(c);

    body.m = density * area;
    body.im = body.m > 0 ? 1 / body.m : 0;
    body.I = I * density;
    body.iI = body.I > 0 ? 1 / body.I : 0;
  }

  setOrient(radians: number): void { this.u.set(radians); }

  setBox(hw: number, hh: number) {
    this.vertices = [
      new Vec2(-hw, -hh),
      new Vec2(hw, -hh),
      new Vec2(hw, hh),
      new Vec2(-hw, hh),
    ];

    this.normals = [
      new Vec2(0, -1),
      new Vec2(1, 0),
      new Vec2(0, 1),
      new Vec2(-1, 0),
    ];
  }

  set(inputVertices: Vec2[]) {
    const count = Math.min(inputVertices.length, MaxPolyVertexCount);

    // Find the right most point on the hull
    let rightMost = 0;
    let highestXCoord = inputVertices[0].x;

    for (let i = 1; i < count; ++i) {
      const x = inputVertices[i].x;

      if (x > highestXCoord) {
        highestXCoord = x;
        rightMost = i;
      } else if (x == highestXCoord) {
        if (inputVertices[i].y < inputVertices[rightMost].y)
          rightMost = i;
      }
    }

    const hull: number[] = new Array<number>(MaxPolyVertexCount);
    let outCount = 0;
    let indexHull = rightMost;
    let vertexCount = 0;

    for (; ;) {
      hull[outCount] = indexHull;

      // Search for next index that wraps around the hull
      // by computing cross products to find the most counter-clockwise
      // vertex in the set, given the previos hull index
      let nextHullIndex = 0;
      for (let i = 1; i < count; ++i) {
        // Skip if same coordinate as we need three unique
        // points in the set to perform a cross product
        if (nextHullIndex == indexHull) {
          nextHullIndex = i;
          continue;
        }

        // Cross every set of three unique vertices
        // Record each counter clockwise third vertex and add
        // to the output hull
        // See : http://www.oocities.org/pcgpe/math2d.html
        const e1 = inputVertices[nextHullIndex].subO(inputVertices[hull[outCount]]);
        const e2 = inputVertices[i].subO(inputVertices[hull[outCount]]);
        const c = e1.cross(e2);

        if (c < 0)
          nextHullIndex = i;

        // Cross product is zero then e vectors are on same line
        // therefore we want to record vertex farthest along that line
        if (c == 0 && e2.lenSqr > e1.lenSqr)
          nextHullIndex = i;
      }

      ++outCount;
      indexHull = nextHullIndex;

      if (nextHullIndex == rightMost) {
        vertexCount = outCount;
        break;
      }
    }

    const vertices = new Array<Vec2>(vertexCount);
    const normals = new Array<Vec2>(vertexCount);
    this.vertices = vertices;
    this.normals = normals;

    for (let i = 0; i < vertexCount; ++i)
      vertices[i] = inputVertices[hull[i]];

    for (let i1 = 0; i1 < vertexCount; ++i1) {
      const i2 = i1 + 1 < vertexCount ? i1 + 1 : 0;
      const face = vertices[i2].subO(vertices[i1]);

      if (!(face.lenSqr > MathEx.epsilon * MathEx.epsilon)) throw new Error("zero length edge.");

      normals[i1] = new Vec2(face.y, -face.x);
      normals[i1].normalize();
    }
  }

  draw(view: Viewport): void {
    const body = this.body;
    const u = this.u;
    const ctx = view.ctx;

    const lineWidth = view.calcLineWidth(2);

    ctx
      .save()
      // .translate(body.position.x, body.position.y)
      // .rotate(body.orient)
      .transform(u.m00, u.m10, u.m01, u.m11, body.position.x, body.position.y)
      .beginPath()
      .withLineWidth(lineWidth)
      .withStrokeStyle(body.brush)
      .strokePoly(this.vertices.map(v => pos(v.x, v.y)), true)
      .restore();
  }

  getSupport(dir: Vec2) {
    const vertices = this.vertices;
    const count = vertices.length;
    let bestProjection = -Infinity;
    let bestVertex = vertices[0];

    for (let i = 0; i < count; i++) {
      const v = vertices[i];
      const projection = v.dot(dir);

      if (projection > bestProjection) {
        bestVertex = v;
        bestProjection = projection;
      }
    }

    return bestVertex;
  }
}
