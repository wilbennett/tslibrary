import { Contact } from '.';

export interface CollisionResolver {
  relaxationCount: number;
  positionalCorrectionRate: number;
  positionalCorrection: boolean;
  globalPositionalCorrection: boolean;

  initialize(contact: Contact): void;
  resolve(contact: Contact, isLastIteration: boolean): void;
  updatePositions(contact: Contact): void;
}
