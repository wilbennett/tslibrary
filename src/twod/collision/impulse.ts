import { CollisionResolverBase, Contact } from '.';
import { dir } from '../../vectors';

// const ZERO_DIRECTION = dir(0, 0);

export class Impulse extends CollisionResolverBase {
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
    const contactPoint0 = contact.points[0];
    const contactPointCount = 1;//contact.points.length;
    const normal = contact.normalAB;

    !this.globalPositionalCorrection && this.correctPositions(shapeA, shapeB, invMassA, invMassB, contactPoint0.depth, normal);

    const integratorA = shapeA.integrator;
    const integratorB = shapeB.integrator;
    const { inverseMass, restitution, staticFriction } = contact.shapes;
    const inertiaA = integratorA.massInfo.inertiaInverse;
    const inertiaB = integratorB.massInfo.inertiaInverse;

    for (const contactPoint of contact.points) {
      const ra = contactPoint.point.subO(integratorA.position);
      const rb = contactPoint.point.subO(integratorB.position);
      // const vOffsetA = ra.scaleO(integratorA.angularVelocity).perpLeft();
      // const vOffsetB = rb.scaleO(integratorB.angularVelocity).perpLeft();
      const vOffsetA = dir(-1 * integratorA.angularVelocity * ra.y, integratorA.angularVelocity * ra.x);
      const vOffsetB = dir(-1 * integratorB.angularVelocity * rb.y, integratorB.angularVelocity * rb.x);
      const va = integratorA.velocity.addO(vOffsetA);
      const vb = integratorB.velocity.addO(vOffsetB);
      const relativeVelocity = vb.subO(va);
      const relVelocityInNormal = relativeVelocity.dot(normal);
      contactPoint.relativeVelocity = relativeVelocity;

      if (relVelocityInNormal > 0) return; // Shapes are moving apart.

      const raCrossN = ra.cross2D(normal);
      const rbCrossN = rb.cross2D(normal);

      const totalInverseMass = inverseMass + raCrossN * raCrossN * inertiaA + rbCrossN * rbCrossN * inertiaB;
      const relVelMagnitudeToRemove = -(1 + restitution) * relVelocityInNormal;
      const impulseMagnitude = relVelMagnitudeToRemove / totalInverseMass;// / contactPointCount;
      const impulse = normal.scaleO(impulseMagnitude);
      // console.log(`velocities: ${integratorA.velocity}, ${integratorB.velocity}`);
      // console.log(`normal: ${normal}`);
      // console.log(`relVelocityInNormal: ${relVelocityInNormal.toLocaleString()} - ${relativeVelocity} - (depth: ${contactPoint.depth.toLocaleString()})`);
      // console.log(`relVelocityInNormal: ${relVelocityInNormal.toLocaleString()} - ${relativeVelocity} - (${contactPoint})`);
      // console.log(`relVelMagnitudeToRemove: ${relVelMagnitudeToRemove.toLocaleString()}`);
      // console.log(`impulseMagnitude: ${impulseMagnitude.toLocaleString()}`);

      // integratorB.applyImpulse(impulse, ZERO_DIRECTION);
      // integratorA.applyImpulse(impulse.negate(), ZERO_DIRECTION);
      // integratorA.angularVelocity -= r1CrossN * impulseMagnitude * inertiaA;
      // integratorB.angularVelocity += r2CrossN * impulseMagnitude * inertiaB;
      integratorB.applyImpulse(impulse, rb);
      integratorA.applyImpulse(impulse.negate(), ra);
      // console.log(`velocities: ${integratorA.velocity}, ${integratorB.velocity}`);
      // console.log(``);

      const tangent = relativeVelocity.subO(normal.scaleO(relVelocityInNormal)).normalize().negate();
      const relVelocityInTangent = relativeVelocity.dot(tangent);

      const raCrossT = ra.cross2D(tangent);
      const rbCrossT = rb.cross2D(tangent);
      const totalInverseMassT = inverseMass + raCrossT * raCrossT * inertiaA + rbCrossT * rbCrossT * inertiaB;

      //*
      // const relTangentMagnitudeToRemove = -(1 + restitution) * relVelocityInTangent * staticFriction;
      const relTangentMagnitudeToRemove = -relVelocityInTangent * staticFriction;
      let tangentImpulseMagnitude = relTangentMagnitudeToRemove / totalInverseMassT / contactPointCount;

      if (tangentImpulseMagnitude > impulseMagnitude)
        tangentImpulseMagnitude = impulseMagnitude; // Friction should be less than force in normal direction.

      const tangentImpulse = tangent.scale(tangentImpulseMagnitude);
      /*/
      // TODO: Investigate switching between static and kinetic friction. This doesn't look right.
      const kineticFriction = contact.shapes.kineticFriction;
      // const relTangentMagnitudeToRemove = -(1 + restitution) * relVelocityInTangent;
      const relTangentMagnitudeToRemove = -relVelocityInTangent;
      let tangentImpulseMagnitude = relTangentMagnitudeToRemove / totalInverseMassT / contactPointCount;
      let tangentImpulse: Vector;
  
      if (Math.abs(tangentImpulseMagnitude) < impulseMagnitude * staticFriction)
        tangentImpulse = tangent.scale(tangentImpulseMagnitude * staticFriction);
      else {
        tangentImpulse = tangent.scale(-impulseMagnitude * kineticFriction);
      }
      //*/

      // integratorB.applyImpulse(tangentImpulse, ZERO_DIRECTION);
      // integratorA.applyImpulse(tangentImpulse.negate(), ZERO_DIRECTION);
      // integratorA.angularVelocity -= r1CrossT * tangentImpulseMagnitude * inertiaA;
      // integratorB.angularVelocity += r2CrossT * tangentImpulseMagnitude * inertiaB;
      integratorB.applyImpulse(tangentImpulse, rb);
      integratorA.applyImpulse(tangentImpulse.negate(), ra);
    }
  }
}
