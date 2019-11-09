import { ICircleShape, ShapeBase } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class CircleShape extends ShapeBase implements ICircleShape {
  kind: "circle" = "circle";

  constructor(radius: number, isWorld?: boolean) {
    super();

    if (isWorld)
      this._isWorld = true;

    this._position = Vector.createPosition(0, 0);
    this.radius = radius;
  }

  protected _position: Vector;
  get position() { return this._position; }
  set position(value) { this._position = value; }
  radius: number;

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    // const orientPos = Vector.createDirection(this.radius, 0);
    const orientPos = Vector.createDirection(this.position.x + this.radius, this.position.y);

    ctx
      .beginPath()
      .circle(this.position, this.radius)
      .moveTo(this.position)
      .lineTo(orientPos);

    props.fillStyle && ctx.fill();
    props.strokeStyle && ctx.stroke();
  }
}
