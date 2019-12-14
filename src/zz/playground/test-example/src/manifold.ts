import { Collision, IBody } from '.';
import { WebColors } from '../../../../colors';
import { MathEx } from '../../../../core';
import { Viewport } from '../../../../twod';
import { dir, Vector } from '../../../../vectors';
import { IEMath } from './iemath';

const { gravity, dt } = IEMath;

function sCross(s: number, v: Vector) { return v.perpLeftO().scale(s); }
function Dot(v1: Vector, v2: Vector) { return v1.dot(v2); }
function Cross(v1: Vector, v2: Vector) { return v1.cross2D(v2); }
function Sqr(n: number) { return n * n; }

export class Manifold {
  constructor(public A: IBody, public B: IBody) {

  }

  penetration: number = 0;
  penetrations: number[] = [];
  normal: Vector = dir(0, 0);
  contacts: Vector[] = [];
  e: number = 0;
  df: number = 0;
  sf: number = 0;

  solve() {
    const a = this.A;
    const b = this.B;

    switch (a.shape.kind) {
      case "circle":
        switch (b.shape.kind) {
          case "circle": return Collision.circleToCircle(this, a, b);
          case "poly": return Collision.circleToPolygon(this, a, b);
        }
        break;
      case "poly":
        switch (b.shape.kind) {
          case "circle": return Collision.polygonToCircle(this, a, b);
          case "poly": return Collision.polygonToPolygon(this, a, b);
        }
        break;
    }
  }

  initialize() {
    this.e = (this.A.restitution + this.B.restitution) * 0.5;
    this.sf = (this.A.staticFriction + this.B.staticFriction) * 0.5;
    this.df = (this.A.dynamicFriction + this.B.dynamicFriction) * 0.5;

    for (let i = 0; i < this.contacts.length; ++i) {
      const ra = this.contacts[i].subO(this.A.position);
      const rb = this.contacts[i].subO(this.B.position);

      const rv = this.B.velocity
        .addO(sCross(this.B.angularVelocity, rb))
        .subO(this.A.velocity)
        .subO(sCross(this.A.angularVelocity, ra));

      // Determine if we should perform a resting collision or not
      // The idea is if the only thing moving this object is gravity,
      // then the collision should be performed without any restitution
      if (rv.magSquared < gravity.scaleO(dt).magSquared + MathEx.epsilon)
        this.e = 0;
    }
  }

  applyImpulse() {
    // Early out and positional correct if both objects have infinite mass
    if (MathEx.isEqualTo(this.A.im + this.B.im, 0)) {
      this.infiniteMassCorrection();
      return;
    }

    const contacts = this.contacts;
    const contactCount = contacts.length;
    const normal = this.normal;

    for (let i = 0; i < contactCount; ++i) {
      // Calculate radii from COM to contact
      const ra = contacts[i].subO(this.A.position);
      const rb = contacts[i].subO(this.B.position);

      let rv = this.B.velocity
        .addO(sCross(this.B.angularVelocity, rb))
        .subO(this.A.velocity)
        .subO(sCross(this.A.angularVelocity, ra));

      const contactVel = Dot(rv, normal); // Relative velocity along the normal

      if (contactVel > 0) return; // Do not resolve if velocities are separating

      const raCrossN = Cross(ra, normal);
      const rbCrossN = Cross(rb, normal);
      const invMassSum = this.A.im + this.B.im + Sqr(raCrossN) * this.A.iI + Sqr(rbCrossN) * this.B.iI;

      let velocityBias = 0;

      if (contactVel < -1)
        velocityBias = -this.e * contactVel;

      // Calculate impulse scalar
      // let j = -(1.0 + this.e) * contactVel;
      let j = -(contactVel - velocityBias);
      j /= invMassSum;

      const impulse = normal.scaleO(j);
      this.A.applyImpulse(impulse.negateO(), ra);
      this.B.applyImpulse(impulse, rb);

      // Friction impulse
      rv = this.B.velocity
        .addO(sCross(this.B.angularVelocity, rb))
        .subO(this.A.velocity)
        .subO(sCross(this.A.angularVelocity, ra));

      const t = rv.subO(normal.scaleO(Dot(rv, normal)));
      t.normalize();

      const raCrossT = Cross(ra, normal);
      const rbCrossT = Cross(rb, normal);
      const invMassSumT = this.A.im + this.B.im + Sqr(raCrossT) * this.A.iI + Sqr(rbCrossT) * this.B.iI;

      // j tangent magnitude
      let jt = -Dot(rv, t);
      jt /= invMassSumT;

      if (MathEx.isEqualTo(jt, 0)) continue; // Don't apply tiny friction impulses

      // Coulumb's law
      let friction = this.sf;
      Math.abs(jt) >= j * friction && (friction = this.df);
      let maxTangentMagnitude = j * friction;
      let tangentMagnitude = jt * friction;
      tangentMagnitude = MathEx.clamp(tangentMagnitude, -maxTangentMagnitude, maxTangentMagnitude);
      const tangentImpulse = t.scaleO(tangentMagnitude);

      // Apply friction impulse
      this.A.applyImpulse(tangentImpulse.negateO(), ra);
      this.B.applyImpulse(tangentImpulse, rb);
    }
  }

  positionalCorrection() {
    const k_slop = 0.05; // Penetration allowance
    const percent = 0.4; // Penetration percentage to correct
    let penetration = this.penetrations[0];
    this.penetrations.length > 1 && (penetration = Math.max(penetration, this.penetrations[1]));
    penetration = Math.max(penetration - k_slop, 0);
    const correction = this.normal.scaleO((penetration / (this.A.im + this.B.im)) * percent);
    this.A.position.displaceByNeg(correction.scaleO(this.A.im));
    this.B.position.displaceBy(correction.scaleO(this.B.im));
  }

  infiniteMassCorrection() {
    this.A.velocity.set(0, 0);
    this.B.velocity.set(0, 0);
  }

  draw(view: Viewport) {
    const ctx = view.ctx;

    const lineWidth = view.calcLineWidth(2);

    ctx.save();

    for (const cp of this.contacts) {
      const n = this.normal.scaleO(0.75);
      const cpEnd = cp.addO(n);

      ctx.beginPath()
        .withLineWidth(lineWidth)
        .withStrokeStyle(WebColors.yellow)
        .moveTo(cp.x, cp.y)
        .lineTo(cpEnd.x, cpEnd.y)
        .stroke();
    }

    ctx.restore();
  }
}
