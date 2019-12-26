import { ColliderBase, Contact, ContactPoint } from '.';
import { MathEx } from '../../core';
import { dir, Vector } from '../../vectors';
import { ICircleShape, IPolygonShape } from '../shapes';

export class CircleCollider extends ColliderBase {
  // constructor(fallback?: Collider) {
  //   super(fallback);
  // }

  // @ts-ignore - unused param.
  protected calcContactCore(shapes: ShapePair, result: Contact, calcDistance: boolean): Tristate<Contact> {
    const { shapeA, shapeB } = result;

    switch (shapeA.kind) {
      case "circle":
        switch (shapeB.kind) {
          case "circle": circleToCircle(result); break;
          case "polygon": circleToPolygon(result); break;
          default: return undefined;
        }
        break;
      case "polygon":
        switch (shapeB.kind) {
          case "circle": polygonToCircle(result); break;
          default: return undefined;
        }
        break;
      default: return undefined;
    }

    return result;
  }
}

const temp1 = dir(0, 0);
const temp2 = dir(0, 0);

function dot(v1: Vector, v2: Vector) { return v1.dot(v2); }
function distSqr(v1: Vector, v2: Vector) { return v1.distanceSquared(v2); }

function circleToCircle(contact: Contact) {
  contact.reset();
  const circleA = <ICircleShape>contact.shapeA;
  const circleB = <ICircleShape>contact.shapeB;
  const contactPoints = contact.points;

  const normal = circleB.position.subO(circleA.position);
  const dist_sqr = normal.magSquared;
  const radius = circleA.radius + circleB.radius;

  if (dist_sqr >= radius * radius) return;

  const distance = Math.sqrt(dist_sqr);

  if (distance === 0) {
    contact.normal = dir(0, 1);
    const penetration = circleA.radius + circleB.radius;
    const maxRadius = Math.max(circleA.radius, circleB.radius);
    contactPoints.push(new ContactPoint(circleA.position.addScaledO(normal, maxRadius), penetration));
  } else {
    normal.div(distance);
    contact.normal = normal;
    contactPoints.push(new ContactPoint(circleA.position.addScaledO(normal, circleA.radius), radius - distance));
  }
}

function circleToPolygon(contact: Contact) {
  contact.reset();
  const aIsCircle = contact.shapeA.kind === "circle";
  const circle = aIsCircle ? <ICircleShape>contact.shapeA : <ICircleShape>contact.shapeB;
  const poly = aIsCircle ? <IPolygonShape>contact.shapeB : <IPolygonShape>contact.shapeA;
  const polyVertices = poly.vertexList.items;
  const polyNormals = poly.normalList.items;
  const contactPoints = contact.points;

  const circleCenter = poly.toLocal(circle.position);
  let separation = -Infinity;
  let edgeIndex = 0;

  for (let i = 0; i < polyVertices.length; ++i) {
    const s = dot(polyNormals[i], circleCenter.subO(polyVertices[i], temp1));

    if (s > circle.radius) return;

    if (s > separation) {
      separation = s;
      edgeIndex = i;
    }
  }

  let v1 = polyVertices[edgeIndex];
  const i2 = edgeIndex + 1 < polyVertices.length ? edgeIndex + 1 : 0;
  let v2 = polyVertices[i2];

  if (separation < MathEx.epsilon) { // Center is inside polygon.
    const normal = poly.toWorld(polyNormals[edgeIndex]).negate();
    contact.normal = normal;
    contactPoints.push(new ContactPoint(circle.position.addScaledO(normal, circle.radius), circle.radius));
    return;
  }

  const dot1 = dot(circleCenter.subO(v1, temp1), v2.subO(v1, temp2));
  const penetration = circle.radius - separation;

  if (dot1 <= 0) { // Closest to v1.
    if (distSqr(circleCenter, v1) > circle.radius * circle.radius) return;

    const normal = v1.subO(circleCenter);
    poly.toWorld(normal, normal);
    normal.normalize();
    v1 = poly.toWorld(v1);
    contact.normal = normal;
    contactPoints.push(new ContactPoint(v1, penetration));
    return;
  }

  const dot2 = dot(circleCenter.subO(v2, temp1), v1.subO(v2, temp2));

  if (dot2 <= 0) { // Closest to v2.
    if (distSqr(circleCenter, v2) > circle.radius * circle.radius) return;

    const normal = v2.subO(circleCenter);
    poly.toWorld(normal, normal);
    normal.normalize();
    v2 = poly.toWorld(v2);
    contact.normal = normal;
    contactPoints.push(new ContactPoint(v2, penetration));
    return;
  }

  // Closest to face.
  let normal = polyNormals[edgeIndex];

  if (dot(circleCenter.subO(v1), normal) > circle.radius) return;

  normal = poly.toWorld(normal);
  contact.normal = normal.negate();
  contactPoints.push(new ContactPoint(circle.position.addScaledO(normal, circle.radius), penetration));
}

function polygonToCircle(contact: Contact) {
  circleToPolygon(contact);
  contact.normal = contact.normal.negateO();
}
