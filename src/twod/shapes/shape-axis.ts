import { Shape } from '.';
import { Vector } from '../../vectors';

export class ShapeAxis {
  constructor(shape: Shape, normal?: Vector, point?: Vector, isWorld?: boolean) {
    this.shape = shape;
    this.normal = normal || Vector.empty;
    this.point = point || Vector.empty;

    if (isWorld)
      this.isWorld = isWorld;
  }

  shape: Shape;
  normal: Vector;
  point: Vector;
  isWorld?: boolean;

  toWorld(result?: ShapeAxis) {
    const shape = this.shape;

    if (this.isWorld) {
      if (!result) return this;

      result.shape = shape;
      result.normal = this.normal;
      result.point = this.point;
      result.isWorld = true;
    }

    if (!result)
      return new ShapeAxis(shape, shape.toWorld(this.normal), shape.toWorld(this.point), true);

    result.shape = shape;
    result.normal = shape.toWorld(this.normal);
    result.point = shape.toWorld(this.point);
    result.isWorld = true;
    return result;
  }

  toLocal(result?: ShapeAxis) {
    const shape = this.shape;

    if (!this.isWorld) {
      if (!result) return this;

      result.shape = shape;
      result.normal = this.normal;
      result.point = this.point;
      result.isWorld = false;
    }

    if (!result)
      return new ShapeAxis(shape, shape.toLocal(this.normal), shape.toLocal(this.point));

    result.shape = shape;
    result.normal = shape.toLocal(this.normal);
    result.point = shape.toLocal(this.point);
    result.isWorld = false;
    return result;
  }

  toLocalSpaceOf(otherShape: Shape, result?: ShapeAxis) {
    const shape = this.shape;

    if (otherShape === shape) return this.toLocal(result);

    result || (result = new ShapeAxis(shape));

    this.toWorld(result);
    result.shape = otherShape;
    return result.toLocal(result);
  }
}
