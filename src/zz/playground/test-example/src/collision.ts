import { IEMath } from '.';
import { MathEx, Tristate } from '../../../../core';
import { ColliderBase, Contact, ContactPoint, ShapePair } from '../../../../twod/collision';
import { ICircleShape, IPolygonShape } from '../../../../twod/shapes';
import { dir, Vector } from '../../../../vectors';

function Dot(v1: Vector, v2: Vector) { return v1.dot(v2); }
function DistSqr(v1: Vector, v2: Vector) { return v1.distanceSquared(v2); }

function assert(condition: boolean) { if (!condition) throw new Error("UNEXPECTED CONDITION"); }

export class Gaul extends ColliderBase {
  // @ts-ignore - unused param.
  protected calcContactCore(shapes: ShapePair, result: Contact, calcDistance: boolean): Tristate<Contact> {
    const { shapeA, shapeB } = result;

    switch (shapeA.kind) {
      case "circle":
        switch (shapeB.kind) {
          case "circle": Collision.circleToCircle(result); break;
          case "polygon": Collision.circleToPolygon(result); break;
          default: break;
        }
        break;
      case "polygon":
        switch (shapeB.kind) {
          case "circle": Collision.polygonToCircle(result); break;
          case "polygon": Collision.polygonToPolygon(result); break;
          default: break;
        }
        break;
      default: break;
    }

    return result;
  }
}

export class Collision {
  static circleToCircle(contact: Contact) {
    contact.reset();
    const A = <ICircleShape>contact.shapeA;
    const B = <ICircleShape>contact.shapeB;
    const contactPoints = contact.points;

    let normal = B.position.subO(A.position); // Calculate translational vector, which is normal

    const dist_sqr = normal.magSquared;
    const radius = A.radius + B.radius;

    if (dist_sqr >= radius * radius) return; // Not in contact

    const distance = Math.sqrt(dist_sqr);

    if (distance === 0) {
      contact.normal = dir(1, 0);
      contactPoints.push(new ContactPoint(A.position.clone(), A.radius));
    } else {
      normal.div(distance); // Faster than using Normalized since we already performed sqrt
      contact.normal = normal;
      contactPoints.push(new ContactPoint(normal.scaleO(A.radius).addO(A.position), radius - distance));
    }
  }

  static circleToPolygon(contact: Contact, flipShapes: boolean = false) {
    contact.reset();
    const A = flipShapes ? <ICircleShape>contact.shapeB : <ICircleShape>contact.shapeA;
    const B = flipShapes ? <IPolygonShape>contact.shapeA : <IPolygonShape>contact.shapeB;
    const verticesB = B.vertexList.items;
    const normalsB = B.normalList.items;
    const contactPoints = contact.points;

    // Transform circle center to Polygon model space
    let center = A.position.clone();
    center = B.toLocal(center);// B.u.transpose().multVec(center.displaceByNegO(b.position));

    // Find edge with minimum penetration
    // Exact concept as using support points in Polygon vs Polygon
    let separation = -Infinity;
    let faceNormal = 0;

    for (let i = 0; i < verticesB.length; ++i) {
      const s = Dot(normalsB[i], center.displaceByNegO(verticesB[i]));

      if (s > A.radius) return;

      if (s > separation) {
        separation = s;
        faceNormal = i;
      }
    }

    // Grab face's vertices
    let v1 = verticesB[faceNormal].clone();
    const i2 = faceNormal + 1 < verticesB.length ? faceNormal + 1 : 0;
    let v2 = verticesB[i2].clone();

    // Check to see if center is within polygon
    if (separation < MathEx.epsilon) {
      const normal = B.toWorld(normalsB[faceNormal]).negate();// B.u.multVec(normalsB[faceNormal]).negateO();
      contact.normal = normal;
      contactPoints.push(new ContactPoint(normal.scaleO(A.radius).addO(A.position), A.radius));
      return;
    }

    // Determine which voronoi region of the edge center of circle lies within
    const dot1 = Dot(center.subO(v1), v2.subO(v1));
    const dot2 = Dot(center.subO(v2), v1.subO(v2));
    const penetration = A.radius - separation;

    if (dot1 <= 0) { // Closest to v1
      if (DistSqr(center, v1) > A.radius * A.radius) return;

      let n = v1.subO(center);
      n = B.toWorld(n);// B.u.multVec(n);
      n.normalize();
      contact.normal = n;
      v1 = B.toWorld(v1);// B.u.multVec(v1).displaceByO(b.position);
      contactPoints.push(new ContactPoint(v1, penetration));
    } else if (dot2 <= 0) { // Closest to v2
      if (DistSqr(center, v2) > A.radius * A.radius) return;

      let n = v2.subO(center);
      v2 = B.toWorld(v2);// B.u.multVec(v2).displaceByO(b.position);
      contactPoints.push(new ContactPoint(v2, penetration));
      n = B.toWorld(n);// B.u.multVec(n);
      n.normalize();
      contact.normal = n;
    } else { // Closest to face
      let n = normalsB[faceNormal].clone();

      if (Dot(center.subO(v1), n) > A.radius) return;

      n = B.toWorld(n);// B.u.multVec(n);
      contact.normal = n.negate();
      contactPoints.push(new ContactPoint(n.scaleO(A.radius).addO(A.position), penetration));
    }
  }

  static polygonToCircle(contact: Contact) {
    this.circleToPolygon(contact, true);
    contact.normal = contact.normal.negateO();
  }

  static polygonToPolygon(contact: Contact) {
    contact.reset();
    const A = <IPolygonShape>contact.shapeA;
    const B = <IPolygonShape>contact.shapeB;
    const contactPoints = contact.points;

    // Check for a separating axis with A's face planes
    let [faceA, penetrationA] = findAxisLeastPenetration(A, B);

    if (penetrationA >= 0) return;

    // Check for a separating axis with B's face planes
    let [faceB, penetrationB] = findAxisLeastPenetration(B, A);

    if (penetrationB >= 0) return;

    let referenceIndex: number;
    let flip = false; // Always point from a to b

    let RefPoly: IPolygonShape; // Reference
    let IncPoly: IPolygonShape; // Incident

    // Determine which shape contains reference face
    if (IEMath.biasGreaterThan(penetrationA, penetrationB)) {
      RefPoly = A;
      IncPoly = B;
      referenceIndex = faceA;
      flip = false;
    } else {
      RefPoly = B;
      IncPoly = A;
      referenceIndex = faceB;
      flip = true;
    }

    // World space incident face
    const incidentFace: Vector[] = new Array<Vector>(2);
    findIncidentFace(incidentFace, RefPoly, IncPoly, referenceIndex);
    const refVertices = RefPoly.vertexList.items;

    // Setup reference face vertices
    let v1 = refVertices[referenceIndex].clone();
    referenceIndex = referenceIndex + 1 === refVertices.length ? 0 : referenceIndex + 1;
    let v2 = refVertices[referenceIndex].clone();

    // Transform vertices to world space
    v1 = RefPoly.toWorld(v1);// RefPoly.u.multVec(v1).displaceByO(RefPoly.position);
    v2 = RefPoly.toWorld(v2);// RefPoly.u.multVec(v2).displaceByO(RefPoly.position);

    // Calculate reference face side normal in world space
    const sidePlaneNormal = v2.subO(v1);
    sidePlaneNormal.normalize();

    // Orthogonalize
    const refFaceNormal = dir(sidePlaneNormal.y, -sidePlaneNormal.x);

    // ax + by = c
    // c is distance from origin
    const refC = Dot(refFaceNormal, v1);
    const negSide = -Dot(sidePlaneNormal, v1);
    const posSide = Dot(sidePlaneNormal, v2);

    // Clip incident face to reference face side planes
    if (clip(sidePlaneNormal.negateO(), negSide, incidentFace) < 2)
      return; // Due to floating point error, possible to not have required points

    if (clip(sidePlaneNormal, posSide, incidentFace) < 2)
      return; // Due to floating point error, possible to not have required points

    // Flip
    contact.normal = flip ? refFaceNormal.negateO() : refFaceNormal;

    // Keep points behind reference face
    let separation = Dot(refFaceNormal, incidentFace[0]) - refC;

    if (separation <= 0) {
      contactPoints.push(new ContactPoint(incidentFace[0], -separation));
    }

    separation = Dot(refFaceNormal, incidentFace[1]) - refC;

    if (separation <= 0) {
      contactPoints.push(new ContactPoint(incidentFace[1], -separation));
    }
  }
}

function findAxisLeastPenetration(A: IPolygonShape, B: IPolygonShape) {
  let bestDistance = -Infinity;
  let bestIndex: number = -1;
  const verticesA = A.vertexList.items;
  const normalsA = A.normalList.items;

  for (let i = 0; i < verticesA.length; ++i) {
    // Retrieve a face normal from A
    let n = normalsA[i].clone();
    const nw = A.toWorld(n);// A.u.multVec(n);

    // Transform face normal into B's model space
    // const buT = B.u.transpose();
    n = B.toLocal(nw);// buT.multVec(nw);

    // Retrieve support point from B along -n
    const s = B.getSupport(n.negateO());

    // Retrieve vertex on face from A, transform into B's model space
    let v = verticesA[i].clone();
    v = A.toWorld(v);
    v = B.toLocal(v);
    // v = A.toLocalOf(B, v);// A.u.multVec(v).displaceByO(A.body.position);
    // v.displaceByNeg(B.body.position);
    // v = buT.multVec(v);

    // Compute penetration distance (in B's model space)
    const d = Dot(n, s.point.displaceByNegO(v));

    if (d > bestDistance) {
      bestDistance = d;
      bestIndex = i;
    }
  }

  return [bestIndex, bestDistance];
}

function findIncidentFace(v: Vector[], RefPoly: IPolygonShape, IncPoly: IPolygonShape, referenceIndex: number) {
  const refNormals = RefPoly.normalList.items;
  const incVertices = IncPoly.vertexList.items;
  const incNormals = IncPoly.normalList.items;
  let referenceNormal = refNormals[referenceIndex].clone();

  // Calculate normal in incident's frame of reference
  // referenceNormal = RefPoly.u.multVec(referenceNormal); // To world space
  // referenceNormal = IncPoly.u.transpose().multVec(referenceNormal); // To incident's model space
  // referenceNormal = RefPoly.toLocalOf(IncPoly, referenceNormal);
  referenceNormal = RefPoly.toWorld(referenceNormal);
  referenceNormal = IncPoly.toLocal(referenceNormal);

  // Find most anti-normal face on incident polygon
  let incidentFace = 0;
  let minDot = Infinity;

  for (let i = 0; i < incVertices.length; ++i) {
    const dot = Dot(referenceNormal, incNormals[i]);

    if (dot < minDot) {
      minDot = dot;
      incidentFace = i;
    }
  }

  // Assign face vertices for incidentFace
  // v[0] = IncPoly.u.multVec(incVertices[incidentFace]).displaceByO(IncPoly.position);
  v[0] = IncPoly.toWorld(incVertices[incidentFace]);
  incidentFace = incidentFace + 1 >= incVertices.length ? 0 : incidentFace + 1;
  // v[1] = IncPoly.u.multVec(incVertices[incidentFace]).displaceByO(IncPoly.position);
  v[1] = IncPoly.toWorld(incVertices[incidentFace]);
}

function clip(n: Vector, c: number, face: Vector[]) {
  let sp = 0;
  const out = [face[0], face[1]];

  // Retrieve distances from each endpoint to the line
  // d = ax + by - c
  const d1 = Dot(n, face[0]) - c;
  const d2 = Dot(n, face[1]) - c;

  // If negative (behind plane) clip
  if (d1 <= 0) out[sp++] = face[0];
  if (d2 <= 0) out[sp++] = face[1];

  // If the points are on different sides of the plane
  if (d1 * d2 < 0) { // less than to ignore -0.0
    // Push interesection point
    const alpha = d1 / (d1 - d2);
    out[sp] = face[0].displaceByO(face[1].displaceByNegO(face[0]).scaleO(alpha));
    ++sp;
  }

  // Assign our new converted values
  face[0] = out[0];
  face[1] = out[1];

  assert(sp !== 3);
  return sp;
}
