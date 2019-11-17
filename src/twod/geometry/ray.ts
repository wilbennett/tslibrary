import { GeometryBase, IRay } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Ray extends GeometryBase implements IRay {
  kind: "ray" = "ray";

  constructor(start: Vector, direction: Vector) {
    super();

    this.position = start;
    this.direction = direction;
  }

  protected _position!: Vector;
  get position() { return this._position; }
  set position(value) {
    this._position = value;
    this.setPosition(value);
  }

  direction: Vector;

  // @ts-ignore - unused param.
  protected renderCore(view: Viewport, props: ContextProps) {
    const mag = view.viewBounds.max.subO(view.viewBounds.min).mag;
    const dir = this.direction.scaleO(mag);
    const end = this.position.displaceByO(dir);

    view.ctx.beginPath().line(this.position, end).stroke();
  }
}
