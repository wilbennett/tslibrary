import { GeometryBase, ICircle } from '.';
import { Viewport } from '..';
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

  protected renderCore(viewport: Viewport) {
    const props = this.props;
    viewport.ctx.beginPath().circle(this.position, this.radius);

    if (props.fillStyle)
      viewport.ctx.fill();

    if (props.strokeStyle)
      viewport.ctx.stroke();
  }
}
