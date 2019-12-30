import { ForceSourceBase } from '.';
import { IWorld } from '..';
import { dir, Vector } from '../../vectors';
import { Collider, ShapePair } from '../collision';
import { AABBShape, Shape } from '../shapes';

const windForce = dir(0, 0);
const force = dir(0, 0);
const temp1 = dir(0, 0);

const CIRCLE_AREA_SCALE = 0.2;

export class Wind extends ForceSourceBase {
  constructor(readonly halfSize: Vector, speedDirection: Vector = dir(0, 0)) {
    super();

    this.speedDirection = speedDirection;

    this._shape = new AABBShape(halfSize);
    this._shape.isCustomCollide = true;
    this._shape.props = { fillStyle: "transparent", strokeStyle: "transparent" };
  }

  protected _world?: IWorld;
  protected _collider?: Collider;
  protected get collider() {
    const world = this._world;
    return this._collider || (this._collider = world?.broadPhase?.collider ?? world?.narrowPhase?.collider);
  }
  protected _shape: Shape;
  protected rotationPercent: number = 0.005;
  protected _speedSquared: number = 0;
  protected _direction: Vector = dir(0, 0);
  protected _speedDirection: Vector = dir(0, 0);
  get speedDirection() { return this._speedDirection; }
  set speedDirection(value) {
    this._speedDirection.withXY(value.x, value.y);
    this._speedDirection.normalizeO(this._direction);
    this._speedSquared = this._speedDirection.magSquared;
  }
  get position() { return this._shape.position; }
  set position(value) { this._shape.position = value; }
  get props() { return this._shape.props; }
  set props(value) { this._shape.props = value; }

  initialize(world: IWorld) {
    this._world = world;
    world.add(this._shape);
  }

  finalize(world: IWorld) {
    world.remove(this._shape);
    this._world = undefined;
    this._collider = undefined;
  }

  setPosition(position: Vector) { this._shape.setPosition(position); }

  // @ts-ignore - unused param.
  protected processCore(shape: Shape, now: number, position: Vector, velocity: Vector) {
    if (!this.collider) return;

    // TODO: Use ShapePairManager to cache.
    const pair = new ShapePair(shape, this._shape);
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

    for (const contactPoint of contactPoints) {
      const strength = contactPoint.depth * depthScale;
      windForce.scaleO(strength, force);
      shape.integrator.applyForce(force);
      windForce.scaleO(strength * this.rotationPercent, force);
      shape.integrator.applyForceAt(contactPoint.point, force);
    }
  }
}
