import { ForceSourceBase } from '.';
import { dir, Vector } from '../../vectors';
import { Contact } from '../collision';
import { Shape } from '../shapes';

const windForce = dir(0, 0);
const force = dir(0, 0);
const temp1 = dir(0, 0);

const CIRCLE_AREA_SCALE = 0.2;

export abstract class WindBase extends ForceSourceBase {
  protected rotationPercent: number = 1;

  calculateForce(shape: Shape, contact: Contact, direction: Vector, speedSquared: number, rotationPercent?: number) {
    const contactPoints = contact.points;
    const totalDepth = contactPoints[0].depth + (contactPoints[1]?.depth ?? 0);
    const depthScale = 1 / totalDepth;

    // air mass (Am) = density * area
    // acceleration (a) = windspeed * windspeed
    // F = Am * a

    let area = shape.kind === "circle" ? (shape.radius + shape.radius) * Math.PI * CIRCLE_AREA_SCALE : 1;
    contactPoints.length > 1 && (area = contactPoints[0].point.subO(contactPoints[1].point, temp1).mag);
    const airMass = shape.material.density * area;
    const acceleration = speedSquared;
    const magnitude = airMass * acceleration;
    direction.scaleO(magnitude, windForce);

    shape.integrator.applyForce(windForce);

    for (const contactPoint of contactPoints) {
      const strength = contactPoint.depth * depthScale;
      windForce.scaleO(strength * (rotationPercent ?? this.rotationPercent), force);
      shape.integrator.applyForceAt(contactPoint.point, force);
    }

    return Vector.empty;
  }
}
