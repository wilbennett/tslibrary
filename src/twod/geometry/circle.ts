import { GeometryBase, ICircle } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Circle extends GeometryBase implements ICircle {
  kind: "circle" = "circle";

  constructor(position: Vector, radius: number) {
    super();

    this.position = position;
    this.radius = radius;
  }

  protected _position!: Vector;
  get position() { return this._position; }
  set position(value) {
    if (!value.isPosition)
      value = value.asPosition();

    this._position = value;
  }

  radius: number;

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    ctx.beginPath().circle(this.position, this.radius);

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
