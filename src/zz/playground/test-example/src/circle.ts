export {}

/*
import { Body, IBody, ICircle, Mat2, Shape } from '.';
import { Viewport } from '../../../../twod';

export class Circle implements ICircle {
  constructor(radius: number) {
    this.radius = radius;

    this.u = new Mat2(0);
  }

  kind: "circle" = "circle";
  _body?: IBody;
  get body(): IBody { return this._body || (this._body = new Body(this, 0, 0)); }
  set body(value) { this._body = value; }
  radius: number;
  u: Mat2;

  clone(): Shape { return new Circle(this.radius); }
  initialize(): void { this.computeMass(1); }

  computeMass(density: number): void {
    const body = this.body;
    body.m = Math.PI * this.radius * this.radius * density;
    body.im = body.m > 0 ? 1 / body.m : 0;
    body.I = body.m * this.radius * this.radius;
    body.iI = body.I > 0 ? 1 / body.I : 0;
  }

  // @ts-ignore - unused param.
  setOrient(radians: number): void { }

  draw(view: Viewport): void {
    const body = this.body;
    // const u = this.u;
    const ctx = view.ctx;

    const lineWidth = view.calcLineWidth(2);

    ctx
      .save()
      .translate(body.position.x, body.position.y)
      .rotate(body.orient)
      // .transform(u.m00, u.m10, u.m01, u.m11, body.position.x, body.position.y)
      .beginPath()
      .withLineWidth(lineWidth)
      .withStrokeStyle(body.brush)
      .strokeCircle(0, 0, this.radius)
      .beginPath()
      .moveTo(0, 0)
      .lineTo(0, this.radius)
      .stroke()
      .restore();
  }
}
//*/
