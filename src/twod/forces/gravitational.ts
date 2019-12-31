import { ForceProcessParams, ForceSourceBase, Gravity } from '.';
import { dir, pos, Vector } from '../../vectors';

const force = dir(0, 0);
const temp1 = dir(0, 0);

export class Gravitational extends ForceSourceBase {
  constructor(public mass: number, public minRadius: number = 15, public maxRadius: number = 30) {
    super();
  }

  protected _position: Vector = pos(0, 0);
  get position() { return this._position; }
  set position(value) { this._position = value; }

  protected processCore(params: ForceProcessParams) {
    const { shape, position } = params;
    // G = universal gravitational constant, m1 = mass1, m2 = mass2
    // r = vector to shape, rNormal = r normalized
    // F = (G * m1 * m2) / r² * rNormal

    const numerator = Gravity.universalConstant * this.mass * shape.massInfo.mass;
    const r = this.position.subO(position, temp1);
    const denom = r.magSquared;

    if (denom < this.minRadius * this.minRadius) return;
    if (denom > this.maxRadius * this.maxRadius) return;

    r.normalizeScaleO(numerator / denom, force);
    shape.integrator.applyForce(force);
  }
}
