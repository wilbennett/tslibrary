import { CollisionResolver, Contact } from '.';
import { Vector } from '../../vectors';
import { Shape } from '../shapes';

export abstract class CollisionResolverBase implements CollisionResolver {
  relaxationCount = 1;
  positionCorrectionRate = 0.8;

  protected positionCorrection(shapeA: Shape, shapeB: Shape, invMassA: number, invMassB: number, depth: number, normal: Vector) {
    const scale = depth / (invMassA + invMassB) * this.positionCorrectionRate;
    const correction = normal.scaleO(scale);
    shapeA.setPosition(shapeA.position.addO(correction.scaleO(-invMassA)));
    shapeB.setPosition(shapeB.position.addO(correction.scale(invMassB)));
  }

  abstract resolve(contact: Contact, isLastIteration: boolean): void;
}
