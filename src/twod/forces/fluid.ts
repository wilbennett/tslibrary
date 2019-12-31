import { ForceProcessParams, ForceSourceBase } from '.';
import { IWorld } from '..';
import { dir, Vector } from '../../vectors';
import { Collider, ShapePair } from '../collision';
import { AABBShape, Shape } from '../shapes';

const drag = dir(0, 0);
const force = dir(0, 0);
const temp1 = dir(0, 0);

const CIRCLE_AREA_SCALE = 0.2;

export class Fluid extends ForceSourceBase {
  constructor(readonly halfSize: Vector, dragCoefficient: number = 0) {
    super();

    this.dragCoefficient = dragCoefficient;

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
  protected rotationPercent: number = 0.1;
  protected _dragCoefficient: number = 0;
  get dragCoefficient() { return this._dragCoefficient; }
  set dragCoefficient(value) {
    this._dragCoefficient = value;
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

  protected processCore(params: ForceProcessParams) {
    if (!this.collider) return;

    const { shape, velocity } = params;

    // TODO: Use ShapePairManager to cache.
    // const pair = new ShapePair(shape, this._shape);
    const pair = new ShapePair(this._shape, shape);
    this.collider.calcContact(pair);
    const contact = pair.contact;

    if (!contact.isCollision) return;

    const contactPoints = contact.points;
    const totalDepth = contactPoints[0].depth + (contactPoints[1]?.depth ?? 0);
    const depthScale = 1 / totalDepth;

    //* p = density, v = velocity, A = area, vNormal = noralized velocity
    //* F = ½p * ║v║² * A * Cd * -vNormal

    let area = shape.kind === "circle" ? (shape.radius + shape.radius) * Math.PI * CIRCLE_AREA_SCALE : 1;
    contactPoints.length > 1 && (area = contactPoints[0].point.subO(contactPoints[1].point, temp1).mag);
    const halfDensity = shape.material.density * 0.5;
    const densityMagSquared = halfDensity * velocity.magSquared;
    const densityMagArea = densityMagSquared * area;
    const magnitude = densityMagArea * this._dragCoefficient;

    // TODO: Angular drag?
    velocity.normalizeScaleO(-magnitude, drag); // Drag applies in the opposite direction of motion.
    shape.integrator.applyForce(drag);

    for (const contactPoint of contactPoints) {
      const strength = contactPoint.depth * depthScale;
      drag.scaleO(strength * this.rotationPercent, force);
      shape.integrator.applyForceAt(contactPoint.point, force);
    }
  }
}
