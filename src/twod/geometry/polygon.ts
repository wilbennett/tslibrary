import { GeometryBase, IPolygon } from '.';
import { ContextProps, Viewport } from '..';
import { Vector, Vector2D, VectorCollection } from '../../vectors';
import * as Poly from './polygon-utils';

export class Polygon extends GeometryBase implements IPolygon {
  kind: "polygon" = "polygon";

  constructor(
    vertexCount: number,
    radius: number,
    startAngle?: number,
    regular?: boolean) {
    super();

    this.radius = radius;
    this._position = Vector.createPosition(0, 0);

    this.vertices = new VectorCollection(vertexCount, Vector2D); // TODO: Make dimension agnostic.
    Poly.generatePoly(this.vertices, radius, startAngle, regular);
  }

  readonly vertices: VectorCollection;
  private _position: Vector;
  get position() { return this._position; }
  set position(value) {
    this.setPosition(value);
    this._position = value;
  }
  readonly radius: number;

  setPosition(position: Vector) {
    Poly.movePoly(this.vertices, this._position, position);
    this._position.copyFrom(position);
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    ctx.beginPath().poly(this.vertices, true);

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
