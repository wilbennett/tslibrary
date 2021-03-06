import { CanvasContext, IWorld, Viewport } from '.';
import { TimeStep } from '../core';
import { Bounds } from '../misc';
import { dir } from '../vectors';
import { BroadPhase, CollisionResolver, Contact, NarrowPhase, ShapePair, ShapePairManager } from './collision';
import { ForceSource, Gravity } from './forces';
import { Shape } from './shapes';

export class World implements IWorld {
  constructor(bounds: Bounds) {
    this.bounds = bounds;
    this.forces = [];

    this.gravityConst = Gravity.earth;
  }

  protected _shapes = new Set<Shape>();
  get shapes() { return this._shapes; }
  protected _pairManager = new ShapePairManager();
  protected _gravity!: Gravity;

  readonly bounds: Bounds;
  view?: Viewport;
  private _gravityConst!: number;
  get gravityConst() { return this._gravityConst; }
  set gravityConst(value) {
    this._gravityConst = value;

    this.forces.remove(this._gravity);
    const gravityAcceleration = dir(0, -this._gravityConst);
    this._gravity = new Gravity(gravityAcceleration);
    this.forces.push(this._gravity);

    // TODO: Used last TimeStep instead.
    this.restingSpeedCutoff = gravityAcceleration.scaleO(TimeStep.DT_60_FPS.dt).mag;
  }
  private _restingSpeedCutoff!: number;
  get restingSpeedCutoff() { return this._restingSpeedCutoff; }
  set restingSpeedCutoff(value) {
    this._restingSpeedCutoff = value;
    this._shapes.forEach(shape => shape.integrator.restingSpeedCuttoff = value);
  }
  protected _worldTime = 0;
  get worldTime() { return this._worldTime; }
  readonly forces: ForceSource[];
  broadPhase?: BroadPhase;
  narrowPhase?: NarrowPhase;
  collisionResolver?: CollisionResolver;
  collidingPairs: ShapePair[] = [];
  contacts: Contact[] = [];

  clear() {
    const self = this;
    this._shapes.forEach(shape => shape.finalize(self));
    this.forces.forEach(force => force.finalize(self));

    this._shapes.clear();
    this._pairManager.clear();
    this.forces.splice(0);
    this.gravityConst = this._gravityConst; // Add gravity back in.
  }

  add(shape: Shape) {
    if (this._shapes.has(shape)) return;

    shape.initialize(this);
    // TODO: Temporary. Naively adding pairs for all shapes. Need to add/remove in broad phase.
    !shape.isCustomCollide && this._pairManager.addShape(shape, this._shapes);
    this._shapes.add(shape);
    shape.integrator.worldForces = this.forces;
    shape.integrator.restingSpeedCuttoff = this._restingSpeedCutoff;
  }

  remove(shape: Shape) {
    this._shapes.delete(shape);
    this._pairManager.removeShape(shape);
    shape.finalize(this);
    shape.integrator.worldForces = [];
  }

  addForce(force: ForceSource, duration?: number, setStartTime: boolean = true) {
    force.initialize(this);
    setStartTime && (force.startTime = this._worldTime);
    duration !== undefined && (force.duration = duration);
    this.forces.push(force);
  }

  removeForce(force: ForceSource) {
    this.forces.remove(force);
    force.finalize(this);
  }

  createView(ctx: CanvasContext, viewBounds?: Bounds, screenBounds?: Bounds) {
    viewBounds || (viewBounds = this.bounds.clone());
    screenBounds || (screenBounds = ctx.bounds.clone());
    return new Viewport(ctx, screenBounds, viewBounds, this.bounds);
  }

  createDefaultView(ctx: CanvasContext, viewBounds?: Bounds, screenBounds?: Bounds) {
    this.view = this.createView(ctx, viewBounds, screenBounds);
  }

  update(now: DOMHighResTimeStamp, timestep: TimeStep) {
    this._worldTime = now;
    const broadPhase = this.broadPhase;
    const narrowPhase = this.narrowPhase;
    const collisionResolver = this.collisionResolver;
    const relaxationCount = Math.max(collisionResolver?.relaxationCount ?? 1, 1);
    let collidingPairs: ShapePair[] = [];
    let contacts: Contact[] = [];

    this.removeExpiredForces();
    this._shapes.forEach(shape => shape.integrator.integrate(now, timestep));

    if (narrowPhase && collisionResolver) {
      collidingPairs = broadPhase
        ? broadPhase.execute(this._shapes, this._pairManager)
        : this._pairManager.pairs;

      if (collidingPairs.length !== 0) {
        contacts = narrowPhase.execute(collidingPairs);

        if (contacts.length !== 0) {
          contacts.forEach(contact => collisionResolver.initialize(contact));

          for (let i = 0; i < relaxationCount; i++) {
            contacts.forEach(contact => collisionResolver.resolve(contact));
          }

          contacts.forEach(contact => collisionResolver.correctPositions(contact));
        }
      }
    }

    this.collidingPairs = collidingPairs;
    this.contacts = contacts;
  }

  // @ts-ignore - unused param.
  render(now: DOMHighResTimeStamp, timestep: TimeStep) {
    const view = this.view;

    if (!view) return;

    view.applyTransform();

    try {
      this._shapes.forEach(shape => !shape.isCustomRender && shape.render(view));
    } finally {
      view.restoreTransform();
    }
  }

  protected removeExpiredForces() {
    const worldTime = this._worldTime;
    const forces = this.forces;

    for (let i = forces.length - 1; i >= 0; i--) {
      const force = forces[i];

      if (!force.isExpired(worldTime)) continue;

      this.removeForce(force);
    }
  }
}
