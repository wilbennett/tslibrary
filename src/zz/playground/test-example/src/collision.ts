import { IBody, ICircle, IEMath, Manifold, PolygonShape, Vec2 } from '.';
import { MathEx } from '../../../../core';

function Dot(v1: Vec2, v2: Vec2) { return v1.dot(v2); }
function DistSqr(v1: Vec2, v2: Vec2) { return v1.distSqr(v2); }

function assert(condition: boolean) { if (!condition) throw new Error("UNEXPECTED CONDITION"); }

export class Collision {
  static circleToCircle(m: Manifold, a: IBody, b: IBody) {
    const A = <ICircle>a.shape;
    const B = <ICircle>b.shape;
    m.contacts = [];

    const normal = b.position.subO(a.position); // Calculate translational vector, which is normal

    const dist_sqr = normal.lenSqr;
    const radius = A.radius + B.radius;

    if (dist_sqr >= radius * radius) return; // Not in contact

    const distance = Math.sqrt(dist_sqr);

    if (distance === 0) {
      m.penetration = A.radius;
      m.normal = new Vec2(1, 0);
      m.contacts.push(a.position.clone());
    } else {
      m.penetration = radius - distance;
      m.normal = normal.div(distance); // Faster than using Normalized since we already performed sqrt
      m.contacts.push(m.normal.scaleO(A.radius).addO(a.position));
    }
  }

  static circleToPolygon(m: Manifold, a: IBody, b: IBody) {
    const A = <ICircle>a.shape;
    const B = <PolygonShape>b.shape;
    m.contacts = [];

    // Transform circle center to Polygon model space
    let center = a.position.clone();
    center = B.u.transpose().multVec(center.subO(b.position));

    // Find edge with minimum penetration
    // Exact concept as using support points in Polygon vs Polygon
    let separation = -Infinity;
    let faceNormal = 0;

    for (let i = 0; i < B.vertices.length; ++i) {
      const s = Dot(B.normals[i], center.subO(B.vertices[i]));

      if (s > A.radius) return;

      if (s > separation) {
        separation = s;
        faceNormal = i;
      }
    }

    // Grab face's vertices
    let v1 = B.vertices[faceNormal].clone();
    const i2 = faceNormal + 1 < B.vertices.length ? faceNormal + 1 : 0;
    let v2 = B.vertices[i2].clone();

    // Check to see if center is within polygon
    if (separation < MathEx.epsilon) {
      m.normal = B.u.multVec(B.normals[faceNormal]).negate();
      m.contacts.push(m.normal.scaleO(A.radius).addO(a.position));
      m.penetration = A.radius;
      return;
    }

    // Determine which voronoi region of the edge center of circle lies within
    const dot1 = Dot(center.subO(v1), v2.subO(v1));
    const dot2 = Dot(center.subO(v2), v1.subO(v2));
    m.penetration = A.radius - separation;

    if (dot1 <= 0) { // Closest to v1
      if (DistSqr(center, v1) > A.radius * A.radius) return;

      let n = v1.subO(center);
      n = B.u.multVec(n);
      n.normalize();
      m.normal = n;
      v1 = B.u.multVec(v1).addO(b.position);
      m.contacts.push(v1);
    } else if (dot2 <= 0) { // Closest to v2
      if (DistSqr(center, v2) > A.radius * A.radius) return;

      let n = v2.subO(center);
      v2 = B.u.multVec(v2).addO(b.position);
      m.contacts.push(v2);
      n = B.u.multVec(n);
      n.normalize();
      m.normal = n;
    } else { // Closest to face
      let n = B.normals[faceNormal].clone();

      if (Dot(center.subO(v1), n) > A.radius) return;

      n = B.u.multVec(n);
      m.normal = n.negate();
      m.contacts.push(m.normal.scaleO(A.radius).addO(a.position));
    }
  }

  static polygonToCircle(m: Manifold, a: IBody, b: IBody) {
    this.circleToPolygon(m, b, a);
    m.normal = m.normal.negate();
  }

  static polygonToPolygon(m: Manifold, a: IBody, b: IBody) {
    const A = <PolygonShape>a.shape;
    const B = <PolygonShape>b.shape;
    m.contacts = [];

    // Check for a separating axis with A's face planes
    let [faceA, penetrationA] = findAxisLeastPenetration(A, B);

    if (penetrationA >= 0) return;

    // Check for a separating axis with B's face planes
    let [faceB, penetrationB] = findAxisLeastPenetration(B, A);

    if (penetrationB >= 0) return;

    let referenceIndex: number;
    let flip = false; // Always point from a to b

    let RefPoly: PolygonShape; // Reference
    let IncPoly: PolygonShape; // Incident

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
    const incidentFace: Vec2[] = new Array<Vec2>(2);
    findIncidentFace(incidentFace, RefPoly, IncPoly, referenceIndex);

    // Setup reference face vertices
    let v1 = RefPoly.vertices[referenceIndex].clone();
    referenceIndex = referenceIndex + 1 === RefPoly.vertices.length ? 0 : referenceIndex + 1;
    let v2 = RefPoly.vertices[referenceIndex].clone();

    // Transform vertices to world space
    v1 = RefPoly.u.multVec(v1).addO(RefPoly.body.position);
    v2 = RefPoly.u.multVec(v2).addO(RefPoly.body.position);

    // Calculate reference face side normal in world space
    const sidePlaneNormal = v2.subO(v1);
    sidePlaneNormal.normalize();

    // Orthogonalize
    const refFaceNormal = new Vec2(sidePlaneNormal.y, -sidePlaneNormal.x);

    // ax + by = c
    // c is distance from origin
    const refC = Dot(refFaceNormal, v1);
    const negSide = -Dot(sidePlaneNormal, v1);
    const posSide = Dot(sidePlaneNormal, v2);

    // Clip incident face to reference face side planes
    if (clip(sidePlaneNormal.negate(), negSide, incidentFace) < 2)
      return; // Due to floating point error, possible to not have required points

    if (clip(sidePlaneNormal, posSide, incidentFace) < 2)
      return; // Due to floating point error, possible to not have required points

    // Flip
    m.normal = flip ? refFaceNormal.negate() : refFaceNormal;

    // Keep points behind reference face
    let cp = 0; // clipped points behind reference face
    let separation = Dot(refFaceNormal, incidentFace[0]) - refC;

    if (separation <= 0) {
      m.contacts.push(incidentFace[0]);
      m.penetration = -separation;
      ++cp;
    } else
      m.penetration = 0;

    separation = Dot(refFaceNormal, incidentFace[1]) - refC;

    if (separation <= 0) {
      m.contacts.push(incidentFace[1]);
      m.penetration += -separation;
      ++cp;
      m.penetration /= cp; // Average penetration
    }
  }
}

function findAxisLeastPenetration(A: PolygonShape, B: PolygonShape) {
  let bestDistance = -Infinity;
  let bestIndex: number = -1;

  for (let i = 0; i < A.vertices.length; ++i) {
    // Retrieve a face normal from A
    let n = A.normals[i].clone();
    const nw = A.u.multVec(n);

    // Transform face normal into B's model space
    const buT = B.u.transpose();
    n = buT.multVec(nw);

    // Retrieve support point from B along -n
    const s = B.getSupport(n.negate());

    // Retrieve vertex on face from A, transform into B's model space
    let v = A.vertices[i].clone();
    v = A.u.multVec(v).addO(A.body.position);
    v.sub(B.body.position);
    v = buT.multVec(v);

    // Compute penetration distance (in B's model space)
    const d = Dot(n, s.subO(v));

    if (d > bestDistance) {
      bestDistance = d;
      bestIndex = i;
    }
  }

  return [bestIndex, bestDistance];
}

function findIncidentFace(v: Vec2[], RefPoly: PolygonShape, IncPoly: PolygonShape, referenceIndex: number) {
  let referenceNormal = RefPoly.normals[referenceIndex].clone();

  // Calculate normal in incident's frame of reference
  referenceNormal = RefPoly.u.multVec(referenceNormal); // To world space
  referenceNormal = IncPoly.u.transpose().multVec(referenceNormal); // To incident's model space

  // Find most anti-normal face on incident polygon
  let incidentFace = 0;
  let minDot = Infinity;

  for (let i = 0; i < IncPoly.vertices.length; ++i) {
    const dot = Dot(referenceNormal, IncPoly.normals[i]);

    if (dot < minDot) {
      minDot = dot;
      incidentFace = i;
    }
  }

  // Assign face vertices for incidentFace
  v[0] = IncPoly.u.multVec(IncPoly.vertices[incidentFace]).addO(IncPoly.body.position);
  incidentFace = incidentFace + 1 >= IncPoly.vertices.length ? 0 : incidentFace + 1;
  v[1] = IncPoly.u.multVec(IncPoly.vertices[incidentFace]).addO(IncPoly.body.position);
}

function clip(n: Vec2, c: number, face: Vec2[]) {
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
    out[sp] = face[0].addO(face[1].subO(face[0]).scaleO(alpha));
    ++sp;
  }

  // Assign our new converted values
  face[0] = out[0];
  face[1] = out[1];

  assert(sp !== 3);
  return sp;
}
