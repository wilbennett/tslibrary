import { Contact } from '.';

export interface CollisionResolver {
  relaxationCount: number;
  penetrationAllowance: number;
  positionalCorrectionRate: number;
  positionalCorrection: boolean;

  initialize(contact: Contact): void;
  resolve(contact: Contact, isLastIteration: boolean): void;
  correctPositions(contact: Contact): void;
}
