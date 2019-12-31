import { ForceProcessParams, ForceSourceBase } from '.';
import { IWorld } from '..';
import { MathEx } from '../../core';
import { dir, pos, Vector } from '../../vectors';
import { Collider, ShapePair } from '../collision';
import { PolygonShape, Shape } from '../shapes';
import { planeDistToPoint } from '../utils/utils2d';

const windForce = dir(0, 0);
const force = dir(0, 0);
const temp1 = dir(0, 0);

const CIRCLE_AREA_SCALE = 0.2;

export class Fan extends ForceSourceBase {
  constructor(baseWidth: number, speedDirection: Vector, decayRate = 0.3) {
    super();

    this._baseWidth = baseWidth;
    this._decayRate = decayRate;
    this.speedDirection = speedDirection;
  }

  protected _world?: IWorld;
  protected _collider?: Collider;
  protected get collider() {
    const world = this._world;
    return this._collider || (this._collider = world?.broadPhase?.collider ?? world?.narrowPhase?.collider);
  }
  minSpeedPercent = 0.05;
  protected _shape?: Shape;
  protected get shape() { return this._shape || (this._shape = this.recreateShape()); }
  protected rotationPercent: number = 1;
  protected _baseWidth: number;
  protected _decayRate: number;
  protected _speedSquared: number = 0;
  protected _direction: Vector = dir(0, 0);
  protected _speedDirection: Vector = dir(0, 0);
  get speedDirection() { return this._speedDirection; }
  set speedDirection(value) {
    this._speedDirection.withXY(value.x, value.y);
    this._speedDirection.normalizeO(this._direction);
    this._speedSquared = this._speedDirection.magSquared;
    this._shape = this.recreateShape();
  }
  get position() { return this.shape.position; }
  set position(value) {
    this.shape.position = value;
    this._shape = this.recreateShape();
  }
  get props() { return this.shape.props; }
  set props(value) { this.shape.props = value; }

  initialize(world: IWorld) {
    this._world = world;
    world.add(this.shape);
  }

  finalize(world: IWorld) {
    world.remove(this.shape);
    this._world = undefined;
    this._collider = undefined;
  }

  setPosition(position: Vector) {
    this.shape.setPosition(position);
  }

  protected processCore(params: ForceProcessParams) {
    if (!this.collider) return;

    const { shape } = params;

    // TODO: Use ShapePairManager to cache.
    // const pair = new ShapePair(shape, this.shape);
    const pair = new ShapePair(this.shape, shape);
    this.collider.calcContact(pair);
    const contact = pair.contact;

    if (!contact.isCollision) return;

    const contactPoints = contact.points;
    const depthScale = 1 / contactPoints.length;

    // air mass (Am) = density * area
    // acceleration (a) = windspeed * windspeed
    // F = Am * a

    let area = shape.kind === "circle" ? (shape.radius + shape.radius) * Math.PI * CIRCLE_AREA_SCALE : 1;
    contactPoints.length > 1 && (area = contactPoints[0].point.subO(contactPoints[1].point, temp1).mag);
    const airMass = shape.material.density * area;

    for (const contactPoint of contactPoints) {
      const distance = planeDistToPoint(this.position, this._direction, contactPoint.point, temp1);
      const speed = MathEx.calcDecay(this._speedDirection.mag, this._decayRate, distance);
      const acceleration = speed * speed;
      const magnitude = airMass * acceleration;
      this._direction.scaleO(magnitude, windForce);

      const strength = contactPoint.depth * depthScale;
      windForce.scaleO(strength, force);
      shape.integrator.applyForce(force);
      windForce.scaleO(strength * this.rotationPercent, force);
      shape.integrator.applyForceAt(contactPoint.point, force);
    }
  }

  protected recreateShape() {
    this._shape && this._world && this._world.remove(this._shape);
    const position = this._shape?.position ?? pos(0, 0);
    const speed = this._speedDirection.mag;
    const distToTarget = Math.abs(MathEx.calcDecayTime(speed, this._decayRate, speed * this.minSpeedPercent));
    const hw = this._baseWidth * 0.5;

    //*
    const heightVec = this._direction.scaleO(distToTarget);
    const baseVec = this._direction.scaleO(hw).perpRight();
    const bl = position.addO(baseVec);
    const br = bl.addO(heightVec);
    const tr = br.addO(baseVec.negateO().scale(2));
    const tl = tr.addO(heightVec.negateO());

    const vertices = [bl, br, tr, tl];
    /*/
    const vertices = [
      pos(0, -hw),
      pos(distToTarget, -hw),
      pos(distToTarget, hw),
      pos(0, hw),
    ];
    //*/

    const props = this._shape?.props ?? { fillStyle: "transparent", strokeStyle: "transparent" };
    const shape = new PolygonShape(vertices, undefined, false, true);
    // shape.angle = this._speedDirection.radians;
    shape.isCustomCollide = true;
    shape.props = props;
    this._world && this._world.add(shape);
    return shape;
  }
}
