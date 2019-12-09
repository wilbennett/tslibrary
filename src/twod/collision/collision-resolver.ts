import { Contact } from '.';

export interface CollisionResolver {
  relaxationCount: number;
  positionalCorrectionRate: number;
  positionalCorrection: boolean;
  globalPositionalCorrection: boolean;

  resolve(contact: Contact, isLastIteration: boolean): void;
  updatePositions(contact: Contact): void;
}
