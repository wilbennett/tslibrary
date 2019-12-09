import { Contact } from '.';

export interface CollisionResolver {
  relaxationCount: number;
  positionalCorrectionRate: number;
  positionalCorrection: boolean;

  resolve(contact: Contact, isLastIteration: boolean): void;
}
