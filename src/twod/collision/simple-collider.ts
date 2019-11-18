import { Collider, ColliderBase, Contact, ContactPoint, ShapePair } from '.';
import { ICircle } from '..';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';
import { ICircleShape } from '../shapes';

export class SimpleCollider extends ColliderBase {
  constructor(fallback?: Collider) {
    super(fallback);
  }

  protected isCollidingCore(shapes: ShapePair): boolean | undefined {
    const { first, second } = shapes;

    switch (first.kind) {
      case "circle":
        switch (second.kind) {
          case "circle": return circleIsCollidingCircle(shapes);
          default: return undefined;
        }
      default: return undefined;
    }
  }

  protected calcContactCore(shapes: ShapePair): Tristate<Contact> {
    const { first, second } = shapes;

    switch (first.kind) {
      case "circle":
        switch (second.kind) {
          case "circle": return circleCalcContactCircle(shapes);
          default: return undefined;
        }
      default: return undefined;
    }
  }
}

function circleIsCollidingCircle(shapes: ShapePair) {
  const a = <ICircle>shapes.first;
  const b = <ICircle>shapes.second;
  const ab = b.position.subO(a.position);
  const totalRadius = a.radius + b.radius
  return ab.magSquared <= totalRadius * totalRadius;
}

function circleCalcContactCircle(shapes: ShapePair) {
  const a = <ICircleShape>shapes.first;
  const b = <ICircleShape>shapes.second;
  const ba = a.position.subO(b.position);
  const totalRadius = a.radius + b.radius;
  const distanceSquared = ba.magSquared;
  const contact = shapes.contact;
  contact.reset();

  if (distanceSquared > totalRadius * totalRadius) {
    contact.normal = ba.normalize();
    return null;
  }

  const distance = ba.mag;
  let depth: number;

  if (distance === 0) {
    depth = a.radius + b.radius;
    contact.normal = Vector.createDirection(0, 1);
  } else {
    depth = totalRadius - distance;
    contact.normal = ba.div(distance);
  }

  const point = a.position.displaceByNegScaledO(contact.normal, a.radius);
  contact.points.push(new ContactPoint(point, depth));
  return contact;
}
