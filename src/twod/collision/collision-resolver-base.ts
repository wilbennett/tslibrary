import { CollisionResolver, Contact } from '.';
import { Vector } from '../../vectors';
import { Shape } from '../shapes';

export abstract class CollisionResolverBase implements CollisionResolver {
  relaxationCount = 1;
  positionalCorrectionRate = 0.8;
  _positionalCorrection?: boolean;
  get positionalCorrection() { return !!this._positionalCorrection; }
  set positionalCorrection(value) { this._positionalCorrection = value; }
  _globalPositionalCorrection?: boolean;
  get globalPositionalCorrection() { return !!this._globalPositionalCorrection; }
  set globalPositionalCorrection(value) { this._globalPositionalCorrection = value; }

  abstract resolve(contact: Contact, isLastIteration: boolean): void;

  updatePositions(contact: Contact) {
    const { shapeA, shapeB } = contact;
    const invMassA = shapeA.massInfo.massInverse;
    const invMassB = shapeB.massInfo.massInverse;
    const contactPoint = contact.points[0]; // Contact keeps deepest point first.

    // if (invMassA === 0 && invMassB === 0) return; //* Immovable pairs screened out in pair manager.
    // if (contactPoint.depth <= 0) return; //* Screened out by narrow phase.

    const normal = contact.normalAB;
    this.correctPositions(shapeA, shapeB, invMassA, invMassB, contactPoint.depth, normal);
  }

  protected correctPositions(shapeA: Shape, shapeB: Shape, invMassA: number, invMassB: number, depth: number, normal: Vector) {
    if (!this.positionalCorrection) return;

    const scale = depth / (invMassA + invMassB) * this.positionalCorrectionRate;
    const correction = normal.scaleO(scale);
    shapeA.setPosition(shapeA.position.addO(correction.scaleO(-invMassA)));
    shapeB.setPosition(shapeB.position.addO(correction.scale(invMassB)));
  }
}
