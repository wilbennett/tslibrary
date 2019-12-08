import { Contact } from '.';

export interface CollisionResolver {
  relaxationCount: number;

  resolve(contact: Contact): void;
}
