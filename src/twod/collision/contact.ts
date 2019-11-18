import { ShapePair } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class ContactPoint {
  constructor(
    public point: Vector, // World.
    public depth: number) {
  }

  get isPenetrating() { return this.depth > 0; }
};

// TODO: Add Contact ID.
export class Contact {
  constructor(public shapes: ShapePair) {
    this.normal = Vector.createDirection(0, 0);
    this.points = [];
  }

  normal: Vector;
  points: ContactPoint[];
  get isContacting() { return this.points.length > 0; }
  protected _props?: ContextProps;
  get props() { return this._props || { strokeStyle: "blue", fillStyle: "blue" }; }

  reset() {
    this.points.splice(0);
  }

  flipNormal() {
    const normal = this.normal;
    this.points.forEach(cp => cp.point.displaceBy(normal.scaleO(cp.depth)));
    normal.negate();
  }

  render(view: Viewport) {
    const props = this.props;
    const temp = Vector.create(0, 0);

    this.points.forEach(cp => {
      cp.point.render(view, undefined, props);
      this.normal.scaleO(cp.depth, temp).render(view, cp.point, props);
    });
  }
}
