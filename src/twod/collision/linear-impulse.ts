import { CollisionResolverBase, Contact } from '.';
import { dir } from '../../vectors';

const ZERO_DIRECTION = dir(0, 0);

export class LinearImpulse extends CollisionResolverBase {
  constructor() {
    super();

    this.positionalCorrection = true;
    this.positionalCorrectionRate = 0.8;
    this.relaxationCount = 1;
  }

  // @ts-ignore - unused param.
  resolve(contact: Contact, isLastIteration: boolean) {
    const { shapeA, shapeB } = contact;
    const invMassA = shapeA.massInfo.massInverse;
    const invMassB = shapeB.massInfo.massInverse;
    const contactPoint = contact.points[0];
    const integratorA = shapeA.integrator;
    const integratorB = shapeB.integrator;
    const normal = contact.normalAB;

    !this.globalPositionalCorrection && this.correctPositions(shapeA, shapeB, invMassA, invMassB, contactPoint.depth, normal);

    const va = integratorA.velocity;
    const vb = integratorB.velocity;
    const relativeVelocity = vb.subO(va);
    const relVelocityInNormal = relativeVelocity.dot(normal);
    contactPoint.relativeVelocity = relativeVelocity;

    if (relVelocityInNormal > 0) return; // Shapes are moving apart.

    const { inverseMass, restitution, staticFriction } = contact.shapes;
    const e = relativeVelocity.magSquared >= integratorA.restingSpeedCuttoffSquared ? restitution : 0;
    const relVelMagnitudeToRemove = -(1 + e) * relVelocityInNormal;
    const impulseMagnitude = relVelMagnitudeToRemove / inverseMass;
    const impulse = normal.scaleO(impulseMagnitude);
    // const impulseA = impulse.scaleO(-invMassA);
    // const impulseB = impulse.scale(invMassB);

    // integratorA.velocity.add(impulseA);
    // integratorB.velocity.add(impulseB);
    integratorB.applyImpulse(impulse, ZERO_DIRECTION);
    integratorA.applyImpulse(impulse.negate(), ZERO_DIRECTION);

    const tangent = relativeVelocity.subO(normal.scaleO(relVelocityInNormal)).normalize().negate();
    const relVelocityInTangent = relativeVelocity.dot(tangent);
    const relTangentMagnitudeToRemove = -relVelocityInTangent;
    let tangentImpulseMagnitude = relTangentMagnitudeToRemove / inverseMass;

    //*
    if (tangentImpulseMagnitude * staticFriction < impulseMagnitude)
      tangentImpulseMagnitude = tangentImpulseMagnitude * staticFriction;
    else
      tangentImpulseMagnitude = impulseMagnitude; // Friction should be less than force in normal direction.
    /*/
    // TODO: Investigate switching between static and kinetic friction. This doesn't look right.
    const kineticFriction = contact.shapes.kineticFriction;

    if (Math.abs(tangentImpulseMagnitude) < impulseMagnitude * staticFriction)
      tangentImpulseMagnitude = tangentImpulseMagnitude * staticFriction;
    else {
      tangentImpulseMagnitude = -impulseMagnitude * kineticFriction;
    }
    //*/

    const tangentImpulse = tangent.scale(tangentImpulseMagnitude);

    // const tangentImpulseA = tangentImpulse.scaleO(-invMassA);
    // const tangentImpulseB = tangentImpulse.scale(invMassB);

    // integratorA.velocity.add(tangentImpulseA);
    // integratorB.velocity.add(tangentImpulseB);
    integratorB.applyImpulse(tangentImpulse, ZERO_DIRECTION);
    integratorA.applyImpulse(tangentImpulse.negate(), ZERO_DIRECTION);
  }
}
