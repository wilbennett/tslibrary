import { Clipper, Contact, ContactPoint } from '.';
import { Vector } from '../../vectors';
import { IPlane, Plane } from '../geometry';
import { Edge } from '../shapes';

export type ClipState = {
  contact: Contact;
  clipPlane?: IPlane;
}

export type ClipProgress = (state: ClipState) => void;

export class Sutherland implements Clipper {
  // @ts-ignore - unused param.
  clip(incidentEdge: Edge, referenceEdge: Edge, result?: ContactPoint[]): ContactPoint[] {
    result || (result = []);

    const refv = referenceEdge.worldEnd.subO(referenceEdge.worldStart).normalize();
    const startDistance = refv.dot(referenceEdge.worldStart);
    this.clipSegment(incidentEdge.worldStart, incidentEdge.worldEnd, refv, startDistance, result);

    if (result.length < 2) return result;

    const endDistance = refv.dot(referenceEdge.worldEnd);
    this.clipSegment(result[0].point, result[1].point, refv.negate(), -endDistance, result);

    if (result.length < 2) return result;

    let refNorm = referenceEdge.worldNormal.negateO();
    // referenceEdge.worldNormal.dot(incidentEdge.worldNormal) >= 0 && refNorm.negate();
    // flip && (refNorm = refNorm.negateO());

    const distance = refNorm.dot(referenceEdge.worldStart);
    result[0].depth = refNorm.dot(result[0].point) - distance;
    result[1].depth = refNorm.dot(result[1].point) - distance;

    result[1].depth < 0 && result.pop();
    result[0].depth < 0 && result.shift();

    return result;
  }

  clipProgress(contact: Contact, callback: ClipProgress): ContactPoint[] {
    const { referenceEdge, incidentEdge, points } = contact;
    let clipPlane: IPlane;

    if (!referenceEdge || !incidentEdge) return points;

    callback({ contact: contact.clone() });

    const refv = referenceEdge.worldEnd.subO(referenceEdge.worldStart).normalize();
    const startDistance = refv.dot(referenceEdge.worldStart);
    this.clipSegment(incidentEdge.worldStart, incidentEdge.worldEnd, refv, startDistance, points);

    if (points.length < 2) return points;

    clipPlane = new Plane("pointnormal", referenceEdge.worldStart, refv.clone());
    callback({ contact: contact.clone(), clipPlane });

    const endDistance = refv.dot(referenceEdge.worldEnd);
    this.clipSegment(points[0].point, points[1].point, refv.negate(), -endDistance, points);

    if (points.length < 2) return points;

    clipPlane = new Plane("pointnormal", referenceEdge.worldEnd, refv.clone());
    callback({ contact: contact.clone(), clipPlane });

    let refNorm = referenceEdge.worldNormal.negateO();
    // referenceEdge.worldNormal.dot(incidentEdge.worldNormal) >= 0 && refNorm.negate();
    // flip && (refNorm = refNorm.negateO());

    const distance = refNorm.dot(referenceEdge.worldStart);
    points[0].depth = refNorm.dot(points[0].point) - distance;
    points[1].depth = refNorm.dot(points[1].point) - distance;

    points[1].depth < 0 && points.pop();
    points[0].depth < 0 && points.shift();

    clipPlane = new Plane("pointnormal", referenceEdge.worldEnd, refNorm);
    const cc = contact.clone();
    callback({ contact: cc, clipPlane });
    callback({ contact: cc });

    return points;
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
}
