import { Contact } from '.';
import { Shape } from '../shapes';

export type ShapePairCustomData = { [index: string]: any };

export class ShapePair {
  constructor(public readonly shapeA: Shape, public readonly shapeB: Shape) {
    this.inverseMass = shapeA.massInfo.massInverse + shapeB.massInfo.massInverse;
    this.inverseInertia = shapeA.massInfo.inertiaInverse + shapeB.massInfo.inertiaInverse;
    // this.restitution = (shapeA.material.restitution + shapeB.material.restitution) * 0.5;
    // this.staticFriction = (shapeA.material.staticFriction + shapeB.material.staticFriction) * 0.5;
    // this.kineticFriction = (shapeA.material.kineticFriction + shapeB.material.kineticFriction) * 0.5;
    this.contact = new Contact(this);
    this.customData = {};

    this.restitution = Math.min(shapeA.material.restitution, shapeB.material.restitution);
    this.staticFriction = Math.sqrt(shapeA.material.staticFriction * shapeB.material.staticFriction);
    this.kineticFriction = Math.sqrt(shapeA.material.kineticFriction * shapeB.material.kineticFriction);
  }

  inverseMass: number;
  inverseInertia: number;
  restitution: number;
  staticFriction: number;
  kineticFriction: number;
  contact: Contact;
  customData: ShapePairCustomData;

  equals(other: ShapePair) {
    return this.shapeA === other.shapeA && this.shapeB === other.shapeB
      || this.shapeA === other.shapeB && this.shapeB === other.shapeA;
  }
}
