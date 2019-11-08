import { containsPoint, Geometry, IGeometry } from '.';
import { ContextProps, Viewport } from '..';
import { MathEx, Tristate } from '../../core';
import { Vector } from '../../vectors';
import { calcIntersectPoint } from './geo-intersect';

export abstract class GeometryBase implements IGeometry {
  protected _props?: ContextProps;
  get props() { return this._props || { strokeStyle: "black", fillStyle: "black" }; }
  set props(value) { this._props = value; }

  lineDash?: number[];

  containsPoint(point: Vector, epsilon: number = MathEx.epsilon) {
    // @ts-ignore - assigment compatibility.
    return containsPoint(this, point, epsilon);
  }

  getIntersectPoint(other: Geometry, result?: Vector): Tristate<Vector> {
    // @ts-ignore - assigment compatibility.
    return calcIntersectPoint(this, other, result);
  }

  // @ts-ignore - unused param.
  protected renderCore(viewport: Viewport) { }

  render(viewport: Viewport) {
    const ctx = viewport.ctx;
    const props = this.props;
    let lineWidth = viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);

    const origLineDash = ctx.getLineDash();
    this.lineDash && ctx.setLineDash(this.lineDash);
    ctx.withProps(props).withLineWidth(lineWidth);

    this.renderCore(viewport);

    ctx.setLineDash(origLineDash);
  }
}
