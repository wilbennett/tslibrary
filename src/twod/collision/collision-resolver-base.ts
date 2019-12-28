import { CollisionResolver, Contact } from '.';
import { pos } from '../../vectors';

const temp1 = pos(0, 0);
const temp2 = pos(0, 0);

export abstract class CollisionResolverBase implements CollisionResolver {
  relaxationCount = 1;
  penetrationAllowance = 0.05;
  positionalCorrectionRate = 0.4;
  _positionalCorrection?: boolean;
  get positionalCorrection() { return !!this._positionalCorrection; }
  set positionalCorrection(value) { this._positionalCorrection = value; }

  // @ts-ignore - unused param.
  initialize(contact: Contact) { }
  abstract resolve(contact: Contact): void;

  correctPositions(contact: Contact) {
    if (!this.positionalCorrection) return;

    const { shapeA, shapeB } = contact;
    const invMassA = shapeA.massInfo.massInverse;
    const invMassB = shapeB.massInfo.massInverse;
    const invMass = invMassA + invMassB;
    const contactPoint = contact.points[0]; // Contact keeps deepest point first.

    // if (invMassA === 0 && invMassB === 0) return; //* Immovable pairs screened out in pair manager.
    // if (contactPoint.depth <= 0) return; //* Screened out by narrow phase.

    const normal = contact.normalAB;
    const penetration = Math.max(contactPoint.depth - this.penetrationAllowance, 0);
    const scale = penetration / invMass * this.positionalCorrectionRate;
    const correction = normal.scaleO(scale, temp1);
    shapeA.setPosition(shapeA.position.addO(correction.scaleO(-invMassA, temp2), temp2));
    shapeB.setPosition(shapeB.position.addO(correction.scale(invMassB), temp2));
  }
}
