import { CollisionResolverBase, Contact } from '.';

export class ProjectionResolver extends CollisionResolverBase {
  constructor() {
    super();

    this.positionalCorrection = true;
    this.relaxationCount = 1;
  }

  initialize(contact: Contact) {
    const { shapeA, shapeB } = contact;
    const integratorA = shapeA.integrator;
    const va = shapeA.integrator.velocity;
    const vb = shapeB.integrator.velocity;
    const relativeVelocity = vb.subO(va);

    contact.isResting = relativeVelocity.magSquared < integratorA.restingSpeedCuttoffSquared;
  }

  resolve(contact: Contact) {
    const { shapeA, shapeB } = contact;
    // const invMassA = shapeA.massInfo.massInverse;
    // const invMassB = shapeB.massInfo.massInverse;
    // const contactPoint = contact.points[0]; // Contact keeps deepest point first.

    // if (invMassA === 0 && invMassB === 0) return; //* Immovable pairs screened out in pair manager.
    // if (contactPoint.depth <= 0) return; //* Screened out by narrow phase.

    const normal = contact.normalAB;
    const restitution = contact.isResting ? 0 : contact.shapes.restitution;
    shapeA.velocity.reflectViaNormal(normal).scale(restitution);
    shapeB.velocity.reflectViaNormal(normal).scale(restitution);
  }
}
