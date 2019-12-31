import { ForceSourceBase } from '.';
import { dir, Vector } from '../../vectors';
import { Shape } from '../shapes';

const force = dir(0, 0);

export class Gravity extends ForceSourceBase {
  constructor(public acceleration: Vector = dir(0, -Gravity.earth)) {
    super();
  }

  static readonly universalConstant = 6.67428e-11;
  static readonly sun = 274;
  static readonly jupiter = 24.92;
  static readonly neptune = 11.15;
  static readonly saturn = 10.44;
  static readonly earth = 9.798;
  static readonly uranus = 8.87;
  static readonly venus = 8.87;
  static readonly mars = 3.71;
  static readonly mercury = 3.7;
  static readonly moon = 1.62;
  static readonly pluto = 0.58;


  protected processCore(
    shape: Shape,
    // @ts-ignore - unused param.
    now: number,
    // @ts-ignore - unused param.
    step: TimeStep,
    // @ts-ignore - unused param.
    position: Vector,
    // @ts-ignore - unused param.
    velocity: Vector,
    // @ts-ignore - unused param.
    angle: number,
    // @ts-ignore - unused param.
    angularVelocity: number) {
    this.acceleration.scaleO(shape.massInfo.mass, force);
    shape.integrator.applyForce(force);
  }
}
