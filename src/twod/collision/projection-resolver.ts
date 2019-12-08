import { CollisionResolverBase, Contact } from '.';

export class ProjectionResolver extends CollisionResolverBase {
  relaxationCount = 2;

  resolve(contact: Contact, isLastIteration: boolean) {
    const { shapeA, shapeB } = contact;
    const invMassA = shapeA.massInfo.massInverse;
    const invMassB = shapeB.massInfo.massInverse;

    // if (invMassA === 0 && invMassB === 0) return; //* Immovable pairs screened out in pair manager.

    let maxDepth = contact.points.reduce((prev, cp) => cp.depth > prev ? cp.depth : prev, 0);

    if (maxDepth === 0) return;

    const normal = contact.normalAB;
    this.positionCorrection(shapeA, shapeB, invMassA, invMassB, maxDepth, normal);

    if (!isLastIteration) return;

    const restitution = (shapeA.material.restitution + shapeB.material.restitution) * 0.5;
    shapeA.velocity.reflectViaNormal(normal).scale(restitution);
    shapeB.velocity.reflectViaNormal(normal).scale(restitution);
  }
}
