import { Contact } from '.';

export interface CollisionResolver {
  resolve(contact: Contact): void;
}
