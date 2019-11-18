import { closestPoint, containsPoint, Geometry, IGeometry } from '.';
import { ContextProps, Viewport } from '..';
import { MathEx, Tristate } from '../../core';
import { Vector } from '../../vectors';
import { calcIntersectPoint } from './geo-intersect';

export abstract class GeometryBase implements IGeometry {
  get position() { return Vector.empty; }
  // @ts-ignore - unused param.
  set position(value) { }
  get center() { return this.position; }

  protected _props?: ContextProps;
  get props() { return this._props || { strokeStyle: "black", fillStyle: "black", lineDash: [] }; }
  set props(value) { this._props = value; }

  setPosition(position: Vector) {
    const thisPosition = this.position;
    thisPosition.copyFrom(position);

    if (!thisPosition.isPosition)
      thisPosition.asPosition();
  }

  containsPoint(point: Vector, epsilon: number = MathEx.epsilon) {
    // @ts-ignore - assigment compatibility.
    return containsPoint(this, point, epsilon);
  }

  closestPoint(point: Vector, hullOnly: boolean = false, result?: Vector) {
    // @ts-ignore - assigment compatibility.
    return closestPoint(this, point, hullOnly, result);
  }

  getIntersectPoint(other: Geometry, result?: Vector): Tristate<Vector> {
    // @ts-ignore - assigment compatibility.
    return calcIntersectPoint(this, other, result);
  }

  // @ts-ignore - unused param.
  protected renderCore(view: Viewport, props: ContextProps) { }

  render(view: Viewport) {
    const ctx = view.ctx;
    const props = this.props;
    let lineWidth = view.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);

    ctx.withProps(props).withLineWidth(lineWidth);

    this.renderCore(view, props);
  }
}
