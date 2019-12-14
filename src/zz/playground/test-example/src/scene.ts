import { Body, Gaul, IBody, IEMath, Manifold } from '.';
import { Viewport } from '../../../../twod';
import { Collider } from '../../../../twod/collision';
import { Shape } from '../../../../twod/shapes';

const { gravity } = IEMath;

export class Scene {
  constructor(public dt: number, public iterations: number) {
    this.collider = new Gaul();
  }

  bodies: IBody[] = [];
  contacts: Manifold[] = [];
  collider: Collider;

  integrateForces(b: IBody, dt: number) {
    if (b.im === 0) return;

    b.velocity.add((b.force.scaleO(b.im).addO(gravity)).scaleO(dt / 2));
    b.angularVelocity += b.torque * b.iI * (dt / 2);
  }

  integrateVelocity(b: IBody, dt: number) {
    if (b.im === 0) return;

    b.position.add(b.velocity.scaleO(dt));
    b.orient += b.angularVelocity * dt;
    b.setOrient(b.orient);
    this.integrateForces(b, dt);
  }

  step() {
    const contacts = this.contacts;
    const bodies = this.bodies;
    const bodyCount = bodies.length;
    const dt = this.dt;

    // Generate new collision info
    contacts.splice(0);

    for (let i = 0; i < bodyCount; ++i) {
      const A = bodies[i];

      for (let j = i + 1; j < bodyCount; ++j) {
        const B = bodies[j];

        if (A.im == 0 && B.im == 0) continue;

        const m = new Manifold(A, B, this.collider);
        m.solve();

        if (m.isCollision)
          contacts.push(m);
      }
    }

    const contactCount = contacts.length;

    // Integrate forces
    for (let i = 0; i < bodyCount; ++i)
      this.integrateForces(bodies[i], dt);

    // Initialize collision
    for (let i = 0; i < contactCount; ++i)
      contacts[i].initialize();

    // Solve collisions
    for (let j = 0; j < this.iterations; ++j)
      for (let i = 0; i < contactCount; ++i)
        contacts[i].applyImpulse();

    // Integrate velocities
    for (let i = 0; i < bodyCount; ++i)
      this.integrateVelocity(bodies[i], dt);

    // Correct positions
    for (let i = 0; i < contactCount; ++i)
      contacts[i].positionalCorrection();

    // Clear all forces
    for (let i = 0; i < bodyCount; ++i) {
      const b = bodies[i];
      b.force.set(0, 0);
      b.torque = 0;
    }
  }

  render(view: Viewport) {
    this.bodies.forEach(body => body.shape.render(view));
    this.contacts.forEach(contact => contact.draw(view));
  }

  add(shape: Shape, x: number, y: number): IBody {
    const b = new Body(shape, x, y);
    this.bodies.push(b);
    return b;
  }

  clear() {
    this.bodies.splice(0);
    this.contacts.splice(0);
  }
}
