import { CollisionResolverBase, Contact } from '.';
import { MathEx } from '../../core';

// const ZERO_DIRECTION = dir(0, 0);

export class Impulse extends CollisionResolverBase {
  constructor() {
    super();

    this.positionalCorrection = true;
    this.positionalCorrectionRate = 0.8;
    this.relaxationCount = 10;
  }

  initialize(contact: Contact) {
    const { shapeA, shapeB } = contact;
    const integratorA = shapeA.integrator;
    const integratorB = shapeB.integrator;
    contact.isResting = false;

    for (const contactPoint of contact.points) {
      const ra = contactPoint.point.subO(integratorA.position);
      const rb = contactPoint.point.subO(integratorB.position);
      const vOffsetA = ra.scaleO(integratorA.angularVelocity).perpLeft();
      const vOffsetB = rb.scaleO(integratorB.angularVelocity).perpLeft();
      const vb = integratorB.velocity.addO(vOffsetB);
      const relativeVelocity = vb.subO(integratorA.velocity).subO(vOffsetA);

      if (relativeVelocity.magSquared < integratorA.restingSpeedCuttoffSquared)
        contact.isResting = true;
    }
  }

  resolve(contact: Contact) {
    const { shapeA, shapeB } = contact;
    const normal = contact.normalAB;

    const integratorA = shapeA.integrator;
    const integratorB = shapeB.integrator;
    const { inverseMass: invMass, staticFriction, kineticFriction } = contact.shapes;
    const restitution = contact.isResting ? 0 : contact.shapes.restitution;
    const inertiaIA = integratorA.massInfo.inertiaInverse;
    const inertiaIB = integratorB.massInfo.inertiaInverse;

    for (const contactPoint of contact.points) {
      // Calculate radii from COM to contact.
      const ra = contactPoint.point.subO(shapeA.position);
      const rb = contactPoint.point.subO(shapeB.position);

      const vOffsetA = ra.scaleO(integratorA.angularVelocity).perpLeft();
      const vOffsetB = rb.scaleO(integratorB.angularVelocity).perpLeft();
      const vb = integratorB.velocity.addO(vOffsetB);
      const relativeVelocity = vb.subO(integratorA.velocity).subO(vOffsetA);

      contactPoint.relativeVelocity = relativeVelocity;
      const relVelocityInNormal = relativeVelocity.dot(normal);

      if (relVelocityInNormal > 0) return; // Shapes are moving apart.

      const raCrossN = ra.cross2D(normal);
      const rbCrossN = rb.cross2D(normal);
      const invMassSum = invMass + raCrossN * raCrossN * inertiaIA + rbCrossN * rbCrossN * inertiaIB;

      let velocityBias = 0;

      if (relVelocityInNormal < -1)
        velocityBias = -restitution * relVelocityInNormal;

      // let relVelMagToRemove = -(1.0 + restitution) * relVelocityInNormal;
      let relVelMagToRemove = -(relVelocityInNormal - velocityBias);
      relVelMagToRemove /= invMassSum;

      const impulse = normal.scaleO(relVelMagToRemove);
      integratorA.applyImpulse(impulse.negateO(), ra);
      integratorB.applyImpulse(impulse, rb);

      // Friction impulse
      const vOffsetTA = ra.scaleO(integratorA.angularVelocity).perpLeft();
      const vOffsetTB = rb.scaleO(integratorB.angularVelocity).perpLeft();
      const vbT = integratorB.velocity.addO(vOffsetTB);
      const relativeVelocityT = vbT.subO(integratorA.velocity).subO(vOffsetTA);

      // const tangent = relativeVelocityT.subO(normal.scaleO(relVelocityInNormal)).normalize();
      const tangent = normal.perpLeftO();
      const raCrossT = ra.cross2D(normal);
      const rbCrossT = rb.cross2D(normal);
      const invMassSumT = invMass + raCrossT * raCrossT * inertiaIA + rbCrossT * rbCrossT * inertiaIB;

      const relVelocityInTangent = relativeVelocityT.dot(tangent);
      let relTangentMagToRemove = -relVelocityInTangent;
      relTangentMagToRemove /= invMassSumT;

      if (MathEx.isEqualTo(relTangentMagToRemove, 0)) continue;

      let friction = staticFriction;
      Math.abs(relTangentMagToRemove) >= relVelMagToRemove * friction && (friction = kineticFriction);
      const maxTangentMagnitude = relVelMagToRemove * friction;
      let tangentMagnitude = relTangentMagToRemove * friction;
      tangentMagnitude = MathEx.clamp(tangentMagnitude, -maxTangentMagnitude, maxTangentMagnitude);
      const tangentImpulse = tangent.scaleO(tangentMagnitude);

      integratorA.applyImpulse(tangentImpulse.negateO(), ra);
      integratorB.applyImpulse(tangentImpulse, rb);
    }
  }
}
