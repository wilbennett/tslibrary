import { CollisionResolverBase, Contact } from '.';

export class ProjectionResolver extends CollisionResolverBase {
  constructor() {
    super();

    this.positionalCorrection = true;
    this.relaxationCount = 2;
  }

  resolve(contact: Contact, isLastIteration: boolean) {
    const { shapeA, shapeB } = contact;
    const invMassA = shapeA.massInfo.massInverse;
    const invMassB = shapeB.massInfo.massInverse;
    const contactPoint = contact.points[0]; // Contact keeps deepest point first.

    // if (invMassA === 0 && invMassB === 0) return; //* Immovable pairs screened out in pair manager.
    // if (contactPoint.depth <= 0) return; //* Screened out by narrow phase.

    const normal = contact.normalAB;
    !this.globalPositionalCorrection && this.correctPositions(shapeA, shapeB, invMassA, invMassB, contactPoint.depth, normal);

    if (!isLastIteration) return;

    const restitution = contact.shapes.restitution;
    shapeA.velocity.reflectViaNormal(normal).scale(restitution);
    shapeB.velocity.reflectViaNormal(normal).scale(restitution);
  }
}
