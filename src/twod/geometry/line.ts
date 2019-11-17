import { GeometryBase, ILine } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Line extends GeometryBase implements ILine {
  kind: "line" = "line";

  constructor(point1: Vector, point2: Vector) {
    super();

    const ab = point2.subO(point1);
    this.normal = ab.perpLeft().normalize();
    const distance = this.normal.dot(point1);
    this.position = this.normal.scaleO(distance);
  }

  readonly normal: Vector;

  protected _position!: Vector;
  get position() { return this._position; }
  set position(value) {
    this._position = value;
    this.setPosition(value);
  }

  get direction() { return this.normal.perpO(); }

  setPosition(position: Vector) {
    const distance = this.normal.dot(position);
    this.normal.scaleO(distance).asPositionO(this._position);
  }

  // @ts-ignore - unused param.
  protected renderCore(view: Viewport, props: ContextProps) {
    const mag = view.viewBounds.max.subO(view.viewBounds.min).magSquared;
    const position = this._position;
    const dir = this.direction.scale(mag);
    const start = position.displaceByO(dir);
    const end = position.displaceByNegO(dir);

    view.ctx.beginPath().line(start, end).stroke();
  }
}
