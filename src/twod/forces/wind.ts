import { ForceProcessParams, ForceSourceBase } from '.';
import { dir, Vector } from '../../vectors';
import { ShapePair } from '../collision';

const windForce = dir(0, 0);
const force = dir(0, 0);
const temp1 = dir(0, 0);

const CIRCLE_AREA_SCALE = 0.2;

export class Wind extends ForceSourceBase {
  constructor(speedDirection: Vector = dir(0, 0)) {
    super();

    this.speedDirection = speedDirection;
  }

  protected rotationPercent: number = 1;
  protected _speedSquared: number = 0;
  protected _direction: Vector = dir(0, 0);
  protected _speedDirection: Vector = dir(0, 0);
  get speedDirection() { return this._speedDirection; }
  set speedDirection(value) {
    this._speedDirection.withXY(value.x, value.y);
    this._speedDirection.normalizeO(this._direction);
    this._speedSquared = this._speedDirection.magSquared;
  }

  protected processCore(params: ForceProcessParams) {
    if (!this._shape) return;
    if (!this.collider) return;

    const { shape } = params;

    // TODO: Use ShapePairManager to cache.
    // const pair = new ShapePair(shape, this._shape);
    const pair = new ShapePair(this._shape, shape);
    this.collider.calcContact(pair);
    const contact = pair.contact;

    if (!contact.isCollision) return;

    const contactPoints = contact.points;
    const totalDepth = contactPoints[0].depth + (contactPoints[1]?.depth ?? 0);
    const depthScale = 1 / totalDepth;

    // air mass (Am) = density * area
    // acceleration (a) = windspeed * windspeed
    // F = Am * a

    let area = shape.kind === "circle" ? (shape.radius + shape.radius) * Math.PI * CIRCLE_AREA_SCALE : 1;
    contactPoints.length > 1 && (area = contactPoints[0].point.subO(contactPoints[1].point, temp1).mag);
    const airMass = shape.material.density * area;
    const acceleration = this._speedSquared;
    const magnitude = airMass * acceleration;
    this._direction.scaleO(magnitude, windForce);

    shape.integrator.applyForce(windForce);

    for (const contactPoint of contactPoints) {
      const strength = contactPoint.depth * depthScale;
      windForce.scaleO(strength * this.rotationPercent, force);
      shape.integrator.applyForceAt(contactPoint.point, force);
    }
  }
}
