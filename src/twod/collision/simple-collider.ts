import { Collider, ColliderBase, Contact, ContactPoint, ShapePair } from '.';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';
import { ICircleShape, IPlaneShape } from '../shapes';

export class SimpleCollider extends ColliderBase {
  constructor(fallback?: Collider) {
    super(fallback);
  }

  protected isCollidingCore(shapes: ShapePair): boolean | undefined {
    const { shapeA: first, shapeB: second } = shapes;

    switch (first.kind) {
      case "circle":
        switch (second.kind) {
          case "circle": return circleIsCollidingCircle(first, second);
          case "plane": return circleIsCollidingPlane(first, second);
          default: return undefined;
        }
      case "plane":
        switch (second.kind) {
          case "circle": return circleIsCollidingPlane(second, first);
          default: return undefined;
        }
      default: return undefined;
    }
  }

  // @ts-ignore - unused param.
  protected calcContactCore(shapes: ShapePair, result: Contact, calcDistance: boolean): Tristate<Contact> {
    const { shapeA: first, shapeB: second } = shapes;

    switch (first.kind) {
      case "circle":
        switch (second.kind) {
          case "circle": return circleCalcContactCircle(first, second, result);
          case "plane": return circleCalcContactPlane(first, second, result);
          default: return undefined;
        }
      case "plane":
        switch (second.kind) {
          case "circle": return circleCalcContactPlane(second, first, result, true);
          default: return undefined;
        }
      default: return undefined;
    }
  }
}

function circleIsCollidingCircle(a: ICircleShape, b: ICircleShape) {
  const ab = b.position.subO(a.position);
  const totalRadius = a.radius + b.radius
  return ab.magSquared <= totalRadius * totalRadius;
}

function circleCalcContactCircle(a: ICircleShape, b: ICircleShape, contact: Contact) {
  const ba = a.position.subO(b.position);
  const totalRadius = a.radius + b.radius;
  const distanceSquared = ba.magSquared;
  contact.reset();

  if (distanceSquared > totalRadius * totalRadius) {
    contact.normal = ba.normalize();
    return null;
  }

  const distance = ba.mag;
  let depth: number;

  if (distance === 0) {
    depth = a.radius + b.radius;
    contact.normal = Vector.direction(0, 1);
  } else {
    depth = totalRadius - distance;
    contact.normal = ba.div(distance);
  }

  const point = a.position.displaceByNegScaledO(contact.normal, a.radius);
  contact.points.push(new ContactPoint(point, depth));
  return contact;
}

function circleIsCollidingPlane(circle: ICircleShape, plane: IPlaneShape) {
  const distance = circle.position.dot(plane.normal) - plane.distance;
  return distance <= circle.radius;
}

function circleCalcContactPlane(circle: ICircleShape, plane: IPlaneShape, contact: Contact, flip: boolean = false) {
  const distance = circle.position.dot(plane.normal) - plane.distance;
  contact.reset();
  contact.normal = plane.normal;

  if (distance > circle.radius) return null;

  const depth = circle.radius - distance;
  const point = circle.position.displaceByNegScaledO(contact.normal, circle.radius);
  contact.points.push(new ContactPoint(point, depth));

  if (flip)
    contact.flipNormal();

  return contact;
}
