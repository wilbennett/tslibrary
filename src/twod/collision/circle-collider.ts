import { ColliderBase, Contact, ContactPoint } from '.';
import { MathEx } from '../../core';
import { dir } from '../../vectors';
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
          case "circle": return circleToCircle(result);
          case "polygon":
          case "aabb": return circleToPolygon(result);
          default: return undefined;
        }

      case "polygon":
      case "aabb":
        switch (shapeB.kind) {
          case "circle": return polygonToCircle(result);
          default: return undefined;
        }

      default: return undefined;
    }
  }
}

const temp1 = dir(0, 0);
const temp2 = dir(0, 0);

function circleToCircle(contact: Contact) {
  contact.reset();
  const circleA = <ICircleShape>contact.shapeA;
  const circleB = <ICircleShape>contact.shapeB;
  const contactPoints = contact.points;

  const normal = circleB.position.subO(circleA.position);
  const dist_sqr = normal.magSquared;
  const radius = circleA.radius + circleB.radius;

  if (dist_sqr >= radius * radius) return null;

  const distance = Math.sqrt(dist_sqr);

  if (distance === 0) {
    contact.normal = dir(0, 1);
    const penetration = circleA.radius + circleB.radius;
    const maxRadius = Math.max(circleA.radius, circleB.radius);
    contactPoints.push(new ContactPoint(circleA.position.addScaledO(normal, maxRadius), penetration));
  } else {
    normal.scale(1 / distance);
    contact.normal = normal;
    contactPoints.push(new ContactPoint(circleA.position.addScaledO(normal, circleA.radius), radius - distance));
  }

  return contact;
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
    const s = polyNormals[i].dot(circleCenter.subO(polyVertices[i], temp1));

    if (s > circle.radius) return null;

    if (s > separation) {
      separation = s;
      edgeIndex = i;
    }
  }

  if (separation < MathEx.epsilon) { // Center is inside polygon.
    const normal = poly.toWorld(polyNormals[edgeIndex]).negate();
    contact.normal = normal;
    contactPoints.push(new ContactPoint(circle.position.addScaledO(normal, circle.radius), circle.radius));
    return contact;
  }

  const v1 = polyVertices[edgeIndex];
  const i2 = edgeIndex + 1 < polyVertices.length ? edgeIndex + 1 : 0;
  const v2 = polyVertices[i2];
  const v1ToCircleCenter = circleCenter.subO(v1, temp1);
  const edge = v2.subO(v1, temp2);
  const edgeLengthSqr = edge.dot(edge);
  const projection = v1ToCircleCenter.dot(edge);
  const penetration = circle.radius - separation;

  if (projection <= 0 || edgeLengthSqr === 0) { // Closest to v1.
    if (v1ToCircleCenter.magSquared > circle.radius * circle.radius) return null;

    const normal = v1ToCircleCenter.negateO();
    poly.toWorld(normal, normal).normalize();
    contact.normal = normal;
    contactPoints.push(new ContactPoint(poly.toWorld(v1), penetration));
    return contact;
  }

  if (projection >= edgeLengthSqr) { // Closest to v2.
    const circleCenterToV2 = v2.subO(circleCenter);

    if (circleCenterToV2.magSquared > circle.radius * circle.radius) return null;

    const normal = poly.toWorld(circleCenterToV2, circleCenterToV2).normalize();
    contact.normal = normal;
    contactPoints.push(new ContactPoint(poly.toWorld(v2), penetration));
    return contact;
  }

  // Closest to face.
  let normal = polyNormals[edgeIndex];

  if (v1ToCircleCenter.dot(normal) > circle.radius) return null;

  normal = poly.toWorld(normal);
  contact.normal = normal.negate();
  contactPoints.push(new ContactPoint(circle.position.addScaledO(normal, circle.radius), penetration));
  return contact;
}

function polygonToCircle(contact: Contact) {
  const result = circleToPolygon(contact);
  result && (result.normal = result.normal.negateO());
  return result;
}
