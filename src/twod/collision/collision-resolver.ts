import { Contact } from '.';

export interface CollisionResolver {
  relaxationCount: number;
  penetrationAllowance: number;
  positionalCorrectionRate: number;
  positionalCorrection: boolean;

  initialize(contact: Contact): void;
  resolve(contact: Contact): void;
  correctPositions(contact: Contact): void;
}
