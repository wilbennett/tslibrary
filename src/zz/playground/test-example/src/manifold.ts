import { Collision, IBody } from '.';
import { WebColors } from '../../../../colors';
import { MathEx } from '../../../../core';
import { Viewport } from '../../../../twod';
import { Contact, ShapePair } from '../../../../twod/collision';
import { Vector } from '../../../../vectors';
import { IEMath } from './iemath';

const { gravity, dt } = IEMath;

function sCross(s: number, v: Vector) { return v.perpLeftO().scale(s); }
function Dot(v1: Vector, v2: Vector) { return v1.dot(v2); }
function Cross(v1: Vector, v2: Vector) { return v1.cross2D(v2); }
function Sqr(n: number) { return n * n; }

export class Manifold {
  constructor(A: IBody, B: IBody) {
    const pair = new ShapePair(A.shape, B.shape);
    this.contact = pair.contact;
  }

  contact: Contact;
  get isCollision() { return this.contact.isCollision; }

  solve() {
    const { shapeA, shapeB } = this.contact;

    switch (shapeA.kind) {
      case "circle":
        switch (shapeB.kind) {
          case "circle": return Collision.circleToCircle(this.contact);
          case "polygon": return Collision.circleToPolygon(this.contact);
        }
        break;
      case "polygon":
        switch (shapeB.kind) {
          case "circle": return Collision.polygonToCircle(this.contact);
          case "polygon": return Collision.polygonToPolygon(this.contact);
        }
        break;
    }
  }

  initialize() {
    const contact = this.contact;
    const { shapeA, shapeB } = contact;
    const angularVelocityA = shapeA.integrator.angularVelocity;
    const angularVelocityB = shapeB.integrator.angularVelocity;
    const contactPoints = contact.points;

    for (let i = 0; i < contactPoints.length; ++i) {
      const contactPoint = contactPoints[i].point;
      const ra = contactPoint.subO(shapeA.position);
      const rb = contactPoint.subO(shapeB.position);

      const rv = shapeB.velocity.displaceByO(sCross(angularVelocityB, rb)).subO(
        shapeA.velocity.displaceByNegO(sCross(angularVelocityA, ra)));

      // Determine if we should perform a resting collision or not
      // The idea is if the only thing moving this object is gravity,
      // then the collision should be performed without any restitution
      if (rv.magSquared < gravity.scaleO(dt).magSquared + MathEx.epsilon)
        contact.isResting = true;
    }
  }

  applyImpulse() {
    const contact = this.contact;
    const im = contact.shapes.inverseMass;

    // Early out and positional correct if both objects have infinite mass
    if (MathEx.isEqualTo(im, 0)) {
      this.infiniteMassCorrection();
      return;
    }

    const { shapeA, shapeB } = contact;
    const angularVelocityA = shapeA.integrator.angularVelocity;
    const angularVelocityB = shapeB.integrator.angularVelocity;
    const contactPoints = contact.points;
    const contactCount = contactPoints.length;
    const normal = contact.normalAB;
    const restitution = contact.isResting ? 0 : contact.shapes.restitution;
    const iIA = shapeA.massInfo.inertiaInverse;
    const iIB = shapeB.massInfo.inertiaInverse;

    for (let i = 0; i < contactCount; ++i) {
      // Calculate radii from COM to contact
      const ra = contactPoints[i].point.subO(shapeA.position);
      const rb = contactPoints[i].point.subO(shapeB.position);

      let rv = shapeB.velocity.displaceByO(sCross(angularVelocityB, rb)).subO(
        shapeA.velocity.displaceByNegO(sCross(angularVelocityA, ra)));

      const contactVel = Dot(rv, normal); // Relative velocity along the normal

      if (contactVel > 0) return; // Do not resolve if velocities are separating

      const raCrossN = Cross(ra, normal);
      const rbCrossN = Cross(rb, normal);
      const invMassSum = im + Sqr(raCrossN) * iIA + Sqr(rbCrossN) * iIB;

      let velocityBias = 0;

      if (contactVel < -1)
        velocityBias = -restitution * contactVel;

      // Calculate impulse scalar
      // let j = -(1.0 + restitution) * contactVel;
      let j = -(contactVel - velocityBias);
      j /= invMassSum;

      const impulse = normal.scaleO(j);
      shapeA.integrator.applyImpulse(impulse.negateO(), ra);
      shapeB.integrator.applyImpulse(impulse, rb);

      // Friction impulse
      rv = shapeB.velocity.displaceByO(sCross(angularVelocityB, rb)).subO(
        shapeA.velocity.displaceByNegO(sCross(angularVelocityA, ra)));

      const t = rv.subO(normal.scaleO(Dot(rv, normal)));
      t.normalize();

      const raCrossT = Cross(ra, normal);
      const rbCrossT = Cross(rb, normal);
      const invMassSumT = im + Sqr(raCrossT) * iIA + Sqr(rbCrossT) * iIB;

      // j tangent magnitude
      let jt = -Dot(rv, t);
      jt /= invMassSumT;

      if (MathEx.isEqualTo(jt, 0)) continue; // Don't apply tiny friction impulses

      // Coulumb's law
      let friction = contact.shapes.staticFriction;
      Math.abs(jt) >= j * friction && (friction = contact.shapes.kineticFriction);
      let maxTangentMagnitude = j * friction;
      let tangentMagnitude = jt * friction;
      tangentMagnitude = MathEx.clamp(tangentMagnitude, -maxTangentMagnitude, maxTangentMagnitude);
      const tangentImpulse = t.scaleO(tangentMagnitude);

      // Apply friction impulse
      shapeA.integrator.applyImpulse(tangentImpulse.negateO(), ra);
      shapeB.integrator.applyImpulse(tangentImpulse, rb);
    }
  }

  positionalCorrection() {
    const k_slop = 0.05; // Penetration allowance
    const percent = 0.4; // Penetration percentage to correct

    const contact = this.contact;
    const { shapeA, shapeB } = contact;
    const contactPoints = contact.points;
    const im = contact.shapes.inverseMass;

    let penetration = contactPoints[0].depth;
    contactPoints.length > 1 && (penetration = Math.max(penetration, contactPoints[1].depth));
    penetration = Math.max(penetration - k_slop, 0);
    const correction = contact.normalAB.scaleO((penetration / im) * percent);
    shapeA.position.displaceByNeg(correction.scaleO(shapeA.massInfo.massInverse));
    shapeB.position.displaceBy(correction.scaleO(shapeB.massInfo.massInverse));
  }

  infiniteMassCorrection() {
    this.contact.shapeA.velocity.set(0, 0);
    this.contact.shapeB.velocity.set(0, 0);
  }

  draw(view: Viewport) {
    const ctx = view.ctx;

    const lineWidth = view.calcLineWidth(2);

    ctx.save();

    for (const cp of this.contact.points) {
      const n = this.contact.normal.scaleO(0.75);
      const cpEnd = cp.point.addO(n);

      ctx.beginPath()
        .withLineWidth(lineWidth)
        .withStrokeStyle(WebColors.yellow)
        .moveTo(cp.point.x, cp.point.y)
        .lineTo(cpEnd.x, cpEnd.y)
        .stroke();
    }

    ctx.restore();
  }
}
