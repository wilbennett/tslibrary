import { GeometryBase, IPolygonBase } from '.';
import { ContextProps, Viewport } from '..';
import { Vector, VectorCollection } from '../../vectors';
import * as Poly from './polygon-utils';

export abstract class PolygonBase extends GeometryBase implements IPolygonBase {
  constructor(vertices: VectorCollection, radius: number) {
    super();

    this.vertexList = vertices;
    this.radius = radius;
    this._position = Vector.createPosition(0, 0);
  }

  readonly vertexList: VectorCollection;
  private _position: Vector;
  get position() { return this._position; }
  set position(value) {
    this.setPosition(value);
    this._position = value;
  }
  readonly radius: number;

  setPosition(position: Vector) {
    Poly.movePoly(this.vertexList, this._position, position);
    this._position.copyFrom(position);
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    ctx.beginPath().poly(this.vertexList, true);

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
