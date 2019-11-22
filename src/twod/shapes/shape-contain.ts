import { ICircleShape, IPolygonShapeBase, Shape } from '.';
import { containsPoint } from '..';
import { MathEx } from '../../core';
import { Vector } from '../../vectors';

export function shapeContainsPoint(shape: Shape, point: Vector, epsilon: number = MathEx.epsilon) {
  switch (shape.kind) {
    case "circle": return circleShapeContainsPoint(shape, point, epsilon);
    case "polygon": return polygonShapeContainsPoint(shape, point, epsilon);
    case "minkowski": return undefined;
    default: return containsPoint(shape, point, epsilon);
  }
}

// Circle.
export function circleShapeContainsPoint(circle: ICircleShape, point: Vector, epsilon: number = MathEx.epsilon) {
  return MathEx.isLessOrEqualTo(point.dot(point), circle.radius * circle.radius, epsilon);
}

// Polygon.
// @ts-ignore - unused param.
export function polygonShapeContainsPoint(poly: IPolygonShapeBase, point: Vector, epsilon: number = MathEx.epsilon) {
  const vertices = poly.vertexList.items;
  const edges = poly.edgeVectorList.items;
  const pvector = Vector.create(0, 0);
  const side = edges[0].cross2D(point.subO(vertices[0], pvector));

  for (let i = 1; i < edges.length; i++) {
    const curSide = edges[i].cross2D(point.subO(vertices[i], pvector));

    if (side * curSide < 0) return false;
  }

  return true;
}
