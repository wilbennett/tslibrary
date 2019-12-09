import { CollisionResolver, Contact } from '.';
import { Vector } from '../../vectors';
import { Shape } from '../shapes';

export abstract class CollisionResolverBase implements CollisionResolver {
  relaxationCount = 1;
  positionalCorrectionRate = 0.8;
  _positionalCorrection?: boolean;
  get positionalCorrection() { return !!this._positionalCorrection; }
  set positionalCorrection(value) { this._positionalCorrection = value; }

  protected correctPositions(shapeA: Shape, shapeB: Shape, invMassA: number, invMassB: number, depth: number, normal: Vector) {
    if (!this.positionalCorrection) return;

    const scale = depth / (invMassA + invMassB) * this.positionalCorrectionRate;
    const correction = normal.scaleO(scale);
    shapeA.setPosition(shapeA.position.addO(correction.scaleO(-invMassA)));
    shapeB.setPosition(shapeB.position.addO(correction.scale(invMassB)));
  }

  abstract resolve(contact: Contact, isLastIteration: boolean): void;
}
