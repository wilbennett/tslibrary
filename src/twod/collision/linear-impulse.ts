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

    const normal = contact.normalAB;
    this.correctPositions(shapeA, shapeB, invMassA, invMassB, contactPoint.depth, normal);

    const integratorA = shapeA.integrator;
    const integratorB = shapeB.integrator;

    //*
    const ra = contactPoint.point.subO(integratorA.position);
    const rb = contactPoint.point.subO(integratorB.position);
    const vOffsetA = dir(-1 * integratorA.angularVelocity * ra.y, integratorA.angularVelocity * ra.x);
    const vOffsetB = dir(-1 * integratorB.angularVelocity * rb.y, integratorB.angularVelocity * rb.x);
    const va = integratorA.velocity.addO(vOffsetA);
    const vb = integratorB.velocity.addO(vOffsetB);
    const relativeVelocity = vb.subO(va);
    contactPoint.relativeVelocity = relativeVelocity;
    /*/
    const v1 = integratorA.velocity;
    const v2 = integratorB.velocity;
    const relativeVelocity = v2.subO(v1);
    //*/

    const relVelocityInNormal = relativeVelocity.dot(normal);

    if (relVelocityInNormal > 0) return; // Shapes are moving apart.

    const totalInverseMass = invMassA + invMassB;
    const restitution = (shapeA.material.restitution + shapeB.material.restitution) * 0.5;
    const staticFriction = (shapeA.material.staticFriction + shapeB.material.staticFriction) * 0.5;

    const relVelMagnitudeToRemove = -(1 + restitution) * relVelocityInNormal;
    const impulseMagnitude = relVelMagnitudeToRemove / totalInverseMass;
    const impulse = normal.scaleO(impulseMagnitude);
    // const impulseA = impulse.scaleO(-invMassA);
    // const impulseB = impulse.scale(invMassB);

    // integratorA.velocity.add(impulseA);
    // integratorB.velocity.add(impulseB);
    integratorB.applyImpulse(impulse, ZERO_DIRECTION);
    integratorA.applyImpulse(impulse.negate(), ZERO_DIRECTION);

    const tangent = relativeVelocity.subO(normal.scaleO(relVelocityInNormal)).normalize().negate();
    const relVelocityInTangent = relativeVelocity.dot(tangent);

    //*
    // const relTangentMagnitudeToRemove = -(1 + restitution) * relVelocityInTangent * staticFriction;
    const relTangentMagnitudeToRemove = -relVelocityInTangent * staticFriction;
    let tangentImpulseMagnitude = relTangentMagnitudeToRemove / totalInverseMass;

    if (tangentImpulseMagnitude > impulseMagnitude)
      tangentImpulseMagnitude = impulseMagnitude; // Friction should be less than force in normal direction.

    const tangentImpulse = tangent.scale(tangentImpulseMagnitude);
    /*/
    // TODO: Investigate switching between static and kinetic friction. This doesn't look right.
    const kineticFriction = (shapeA.material.kineticFriction + shapeB.material.kineticFriction) * 0.5;
    // const relTangentMagnitudeToRemove = -relVelocityInTangent;
    const relTangentMagnitudeToRemove = -(1 + restitution) * relVelocityInTangent;
    let tangentImpulseMagnitude = relTangentMagnitudeToRemove / totalInverseMass;
    let tangentImpulse: Vector;

    if (Math.abs(tangentImpulseMagnitude) < impulseMagnitude * staticFriction)
      tangentImpulse = tangent.scale(tangentImpulseMagnitude * staticFriction);
    else {
      tangentImpulse = tangent.scale(-impulseMagnitude * kineticFriction);
    }
    //*/

    // const tangentImpulseA = tangentImpulse.scaleO(-invMassA);
    // const tangentImpulseB = tangentImpulse.scale(invMassB);

    // integratorA.velocity.add(tangentImpulseA);
    // integratorB.velocity.add(tangentImpulseB);
    integratorB.applyImpulse(tangentImpulse, ZERO_DIRECTION);
    integratorA.applyImpulse(tangentImpulse.negate(), ZERO_DIRECTION);
  }
}
