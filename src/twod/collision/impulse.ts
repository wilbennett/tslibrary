import { CollisionResolverBase, Contact } from '.';
import { MathEx } from '../../core';
import { dir } from '../../vectors';

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
      const vOffsetA = dir(-integratorA.angularVelocity * ra.y, integratorA.angularVelocity * ra.x);
      const vOffsetB = dir(-integratorB.angularVelocity * rb.y, integratorB.angularVelocity * rb.x);
      const vb = integratorB.velocity.addO(vOffsetB);
      const relativeVelocity = vb.subO(integratorA.velocity).subO(vOffsetA);

      if (relativeVelocity.magSquared < integratorA.restingSpeedCuttoffSquared)
        contact.isResting = true;
    }
  }

  // @ts-ignore - unused param.
  resolve(contact: Contact, isLastIteration: boolean) {
    const { shapeA, shapeB } = contact;
    const invMassA = shapeA.massInfo.massInverse;
    const invMassB = shapeB.massInfo.massInverse;
    const normal = contact.normalAB;

    if (!this.globalPositionalCorrection)
      this.correctPositions(shapeA, shapeB, invMassA, invMassB, contact.points[0].depth, normal);

    const integratorA = shapeA.integrator;
    const integratorB = shapeB.integrator;
    const { inverseMass, staticFriction } = contact.shapes;
    const restitution = contact.isResting ? 0 : contact.shapes.restitution;
    const inertiaA = integratorA.massInfo.inertiaInverse;
    const inertiaB = integratorB.massInfo.inertiaInverse;

    for (const contactPoint of contact.points) {
      const ra = contactPoint.point.subO(integratorA.position);
      const rb = contactPoint.point.subO(integratorB.position);
      const vOffsetA = ra.scaleO(integratorA.angularVelocity).perpLeft();
      const vOffsetB = rb.scaleO(integratorB.angularVelocity).perpLeft();
      // const vOffsetA = dir(-integratorA.angularVelocity * ra.y, integratorA.angularVelocity * ra.x);
      // const vOffsetB = dir(-integratorB.angularVelocity * rb.y, integratorB.angularVelocity * rb.x);
      const vb = integratorB.velocity.addO(vOffsetB);
      const relativeVelocity = vb.subO(integratorA.velocity).subO(vOffsetA);
      const relVelocityInNormal = relativeVelocity.dot(normal);
      contactPoint.relativeVelocity = relativeVelocity;

      if (relVelocityInNormal > 0) return; // Shapes are moving apart.

      const raCrossN = ra.cross2D(normal);
      const rbCrossN = rb.cross2D(normal);

      const totalInverseMass = inverseMass + raCrossN * raCrossN * inertiaA + rbCrossN * rbCrossN * inertiaB;
      const relVelMagnitudeToRemove = -(1 + restitution) * relVelocityInNormal;
      const impulseMagnitude = relVelMagnitudeToRemove / totalInverseMass;
      const impulse = normal.scaleO(impulseMagnitude);
      // console.log(`velocities: ${integratorA.velocity}, ${integratorB.velocity}`);
      // console.log(`normal: ${normal}`);
      // console.log(`relVelocityInNormal: ${relVelocityInNormal.toLocaleString()} - ${relativeVelocity} - (depth: ${contactPoint.depth.toLocaleString()})`);
      // console.log(`relVelocityInNormal: ${relVelocityInNormal.toLocaleString()} - ${relativeVelocity} - (${contactPoint})`);
      // console.log(`relVelMagnitudeToRemove: ${relVelMagnitudeToRemove.toLocaleString()}`);
      // console.log(`impulseMagnitude: ${impulseMagnitude.toLocaleString()}`);

      // const ZERO_DIRECTION = dir(0, 0);
      // integratorB.applyImpulse(impulse, ZERO_DIRECTION);
      // integratorA.applyImpulse(impulse.negate(), ZERO_DIRECTION);
      // integratorA.angularVelocity -= raCrossN * impulseMagnitude * inertiaA;
      // integratorB.angularVelocity += rbCrossN * impulseMagnitude * inertiaB;
      integratorB.applyImpulse(impulse, rb);
      integratorA.applyImpulse(impulse.negate(), ra);
      // console.log(`velocities: ${integratorA.velocity}, ${integratorB.velocity}`);
      // console.log(``);

      // const vOffsetTA = dir(-integratorA.angularVelocity * ra.y, integratorA.angularVelocity * ra.x);
      // const vOffsetTB = dir(-integratorB.angularVelocity * rb.y, integratorB.angularVelocity * rb.x);
      const vOffsetTA = ra.scaleO(integratorA.angularVelocity).perpLeft();
      const vOffsetTB = rb.scaleO(integratorB.angularVelocity).perpLeft();
      const vbT = integratorB.velocity.addO(vOffsetTB);
      const relativeVelocityT = vbT.subO(integratorA.velocity).subO(vOffsetTA);

      const tangent = relativeVelocityT.subO(normal.scaleO(relVelocityInNormal)).normalize();//.negate();
      const relVelocityInTangent = relativeVelocityT.dot(tangent);

      const raCrossT = ra.cross2D(tangent);
      const rbCrossT = rb.cross2D(tangent);
      const totalInverseMassT = inverseMass + raCrossT * raCrossT * inertiaA + rbCrossT * rbCrossT * inertiaB;
      const relTangentMagnitudeToRemove = -relVelocityInTangent;
      let tangentImpulseMagnitude = relTangentMagnitudeToRemove / totalInverseMassT;
      let friction = staticFriction;

      if (MathEx.isEqualTo(0, tangentImpulseMagnitude)) return;

      /*
      if (tangentImpulseMagnitude * friction < impulseMagnitude)
        tangentImpulseMagnitude = tangentImpulseMagnitude * friction;
      else
        tangentImpulseMagnitude = -impulseMagnitude * friction; // Friction should be less than force in normal direction.
      /*/
      // TODO: Investigate switching between static and kinetic friction. This doesn't look right.
      const kineticFriction = contact.shapes.kineticFriction;

      if (Math.abs(tangentImpulseMagnitude) > impulseMagnitude * staticFriction)
        friction = kineticFriction;

      const maxTangentMagnitude = impulseMagnitude * friction;
      tangentImpulseMagnitude = tangentImpulseMagnitude * friction;
      tangentImpulseMagnitude = MathEx.clamp(tangentImpulseMagnitude, -maxTangentMagnitude, maxTangentMagnitude);
      //*/

      const tangentImpulse = tangent.scale(tangentImpulseMagnitude);

      // integratorB.applyImpulse(tangentImpulse, ZERO_DIRECTION);
      // integratorA.applyImpulse(tangentImpulse.negate(), ZERO_DIRECTION);
      // integratorA.angularVelocity -= r1CrossT * tangentImpulseMagnitude * inertiaA;
      // integratorB.angularVelocity += r2CrossT * tangentImpulseMagnitude * inertiaB;
      integratorB.applyImpulse(tangentImpulse, rb);
      integratorA.applyImpulse(tangentImpulse.negate(), ra);
    }
  }
}
