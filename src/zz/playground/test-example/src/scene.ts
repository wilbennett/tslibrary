import { Body, IBody, IEMath, Manifold, Shape } from '.';
import { Viewport } from '../../../../twod';

const { gravity } = IEMath;

export class Scene {
  constructor(public dt: number, public iterations: number) {
  }

  bodies: IBody[] = [];
  contacts: Manifold[] = [];

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

  integrate(b: IBody, dt: number) {
    if (b.im === 0) return;

    this.integrateForces(b, dt);
    this.integrateVelocity(b, dt);
  }

  broadPhase() {
    const contacts = this.contacts;
    const bodies = this.bodies;
    const bodyCount = bodies.length;

    // Generate new collision info
    contacts.splice(0);

    for (let i = 0; i < bodyCount; ++i) {
      const A = bodies[i];

      for (let j = i + 1; j < bodyCount; ++j) {
        const B = bodies[j];

        if (A.im == 0 && B.im == 0) continue;

        const m = new Manifold(A, B);
        m.solve();

        if (m.contacts.length > 0)
          contacts.push(m);
      }
    }

    // Initialize collision
    this.initializeCollisions(contacts);
  }

  integrateAll(bodies: IBody[], dt: number) {
    const bodyCount = bodies.length;

    for (let i = 0; i < bodyCount; ++i)
      this.integrate(bodies[i], dt);
  }

  initializeCollisions(contacts: Manifold[]) {
    const contactCount = contacts.length;

    for (let i = 0; i < contactCount; ++i)
      contacts[i].initialize();
  }

  solveCollisions(contacts: Manifold[]) {
    const contactCount = contacts.length;

    for (let i = 0; i < contactCount; ++i)
      contacts[i].applyImpulse();
  }

  positionalCorrection(contacts: Manifold[]) {
    const contactCount = contacts.length;

    for (let i = 0; i < contactCount; ++i)
      contacts[i].positionalCorrection();
  }

  step() {
    const contacts = this.contacts;
    const bodies = this.bodies;
    const bodyCount = bodies.length;
    const dt = this.dt;

    // Integrate
    this.integrateAll(bodies, dt);
    // Generate new collision info
    this.broadPhase();

    // Solve collisions
    for (let j = 0; j < this.iterations; ++j)
      this.solveCollisions(contacts);

    // Correct positions
    this.positionalCorrection(contacts);

    // Clear all forces
    for (let i = 0; i < bodyCount; ++i) {
      const b = bodies[i];
      b.force.set(0, 0);
      b.torque = 0;
    }
  }

  render(view: Viewport) {
    this.bodies.forEach(body => body.shape.draw(view));
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
