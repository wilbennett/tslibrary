import { ClipCallback, Clipper, Contact, ContactPoint } from '.';
import { Vector } from '../../vectors';
import { IPlane, Plane } from '../geometry';
import { Edge } from '../shapes';

export class Sutherland implements Clipper {
  clip(contact: Contact, callback?: ClipCallback): ContactPoint[] {
    if (callback)
      return this.clipProgressCore(contact, callback);

    const referenceEdge = contact.referenceEdge;
    const incidentEdge = contact.incidentEdge;

    if (!referenceEdge || !incidentEdge) return contact.points;

    return this.clipCore(incidentEdge, referenceEdge, contact.points);
  }

  protected clipSegment(start: Vector, end: Vector, normal: Vector, dist: number, points: ContactPoint[]) {
    points.splice(0);
    const startDistance = normal.dot(start) - dist;
    const endDistance = normal.dot(end) - dist;

    // Keep points on the plane or in the positive halfspace of the plane.
    if (startDistance >= 0) points.push(new ContactPoint(start, 0));
    if (endDistance >= 0) points.push(new ContactPoint(end, 0));

    // Clip points on opposing sides of the plane.
    if (startDistance * endDistance < 0) {
      const e = end.displaceByNegO(start);
      const u = startDistance / (startDistance - endDistance);
      start.displaceByScaledO(e, u, e);
      points.push(new ContactPoint(e, 0));
    }

    return points;
  }

  protected clipCore(incidentEdge: Edge, referenceEdge: Edge, result?: ContactPoint[]): ContactPoint[] {
    result || (result = []);

    const refv = referenceEdge.end.subO(referenceEdge.start).normalize();
    const startDistance = refv.dot(referenceEdge.start);
    this.clipSegment(incidentEdge.start, incidentEdge.end, refv, startDistance, result);

    if (result.length < 2) return result;

    const endDistance = refv.dot(referenceEdge.end);
    this.clipSegment(result[0].point, result[1].point, refv.negate(), -endDistance, result);

    if (result.length < 2) return result;

    let refNorm = referenceEdge.normal.negateO();
    // flip && (refNorm = refNorm.negateO());

    const contactPoint0 = result[0];
    const contactPoint1 = result[1];
    const distance = refNorm.dot(referenceEdge.start);
    contactPoint0.depth = refNorm.dot(contactPoint0.point) - distance;
    contactPoint1.depth = refNorm.dot(contactPoint1.point) - distance;

    contactPoint1.depth < 0 && result.pop();
    contactPoint0.depth < 0 && result.shift();

    return result;
  }

  protected clipProgressCore(contact: Contact, callback: ClipCallback): ContactPoint[] {
    const { referenceEdge, incidentEdge, points } = contact;
    let clipPlane: IPlane;

    if (!referenceEdge || !incidentEdge) return points;

    callback({ contact: contact.clone() });

    const refv = referenceEdge.end.subO(referenceEdge.start).normalize();
    const startDistance = refv.dot(referenceEdge.start);
    this.clipSegment(incidentEdge.start, incidentEdge.end, refv, startDistance, points);

    if (points.length < 2) return points;

    clipPlane = new Plane("pointnormal", referenceEdge.start, refv.clone());
    callback({ contact: contact.clone(), clipPlane });

    const endDistance = refv.dot(referenceEdge.end);
    this.clipSegment(points[0].point, points[1].point, refv.negate(), -endDistance, points);

    if (points.length < 2) return points;

    clipPlane = new Plane("pointnormal", referenceEdge.end, refv.clone());
    callback({ contact: contact.clone(), clipPlane });

    let refNorm = referenceEdge.normal.negateO();
    // flip && (refNorm = refNorm.negateO());

    const distance = refNorm.dot(referenceEdge.start);
    points[0].depth = refNorm.dot(points[0].point) - distance;
    points[1].depth = refNorm.dot(points[1].point) - distance;

    points[1].depth < 0 && points.pop();
    points[0].depth < 0 && points.shift();

    clipPlane = new Plane("pointnormal", referenceEdge.end, refNorm);
    const cc = contact.clone();
    callback({ contact: cc, clipPlane });
    callback({ contact: cc });

    return points;
  }
}
