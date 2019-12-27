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

    this.gravityConst = 9.8;
  }

  protected _shapes = new Set<Shape>();
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

    this.restingSpeedCutoff = gravityAcceleration.scaleO(TimeStep.DT_60_FPS.dt).mag;
  }
  private _restingSpeedCutoff!: number;
  get restingSpeedCutoff() { return this._restingSpeedCutoff; }
  set restingSpeedCutoff(value) {
    this._restingSpeedCutoff = value;
    this._shapes.forEach(shape => shape.integrator.restingSpeedCuttoff = value);
  }
  readonly forces: ForceSource[];
  broadPhase?: BroadPhase;
  narrowPhase?: NarrowPhase;
  collisionResolver?: CollisionResolver;
  collidingPairs: ShapePair[] = [];
  contacts: Contact[] = [];

  clear() {
    this._shapes.clear();
    this._pairManager.clear();
  }

  add(shape: Shape) {
    if (this._shapes.has(shape)) return;

    this._pairManager.addShape(shape, this._shapes);
    this._shapes.add(shape);
    shape.integrator.worldForces = this.forces;
    shape.integrator.restingSpeedCuttoff = this._restingSpeedCutoff;
  }

  remove(shape: Shape) {
    this._shapes.delete(shape);
    this._pairManager.removeShape(shape);
    shape.integrator.worldForces = [];
  }

  createView(ctx: CanvasContext, viewBounds?: Bounds, screenBounds?: Bounds) {
    viewBounds || (viewBounds = this.bounds.clone());
    screenBounds || (screenBounds = ctx.bounds.clone());
    return new Viewport(ctx, screenBounds, viewBounds, this.bounds);
  }

  createDefaultView(ctx: CanvasContext, viewBounds?: Bounds, screenBounds?: Bounds) {
    this.view = this.createView(ctx, viewBounds, screenBounds);
  }

  update(timestep: TimeStep, now: DOMHighResTimeStamp) {
    const broadPhase = this.broadPhase;
    const narrowPhase = this.narrowPhase;
    const collisionResolver = this.collisionResolver;
    const relaxationCount = Math.max(collisionResolver ? collisionResolver.relaxationCount : 1, 1);
    const lastIndex = relaxationCount - 1;
    let collidingPairs: ShapePair[] = [];
    let contacts: Contact[] = [];

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
            const isLastIteration = i === lastIndex;
            contacts.forEach(contact => collisionResolver.resolve(contact, isLastIteration));
          }
        }
      }
    }

    this.collidingPairs = collidingPairs;
    this.contacts = contacts;
    // this._shapes.forEach(shape => shape.integrator.integrate(now, timestep));

    if (collisionResolver && collisionResolver.globalPositionalCorrection)
      contacts.forEach(contact => collisionResolver.updatePositions(contact));
  }

  // @ts-ignore - unused param.
  render(timestep: TimeStep, now: DOMHighResTimeStamp) {
    const view = this.view;

    if (!view) return;

    view.applyTransform();

    try {
      this._shapes.forEach(shape => shape.render(view));
    } finally {
      view.restoreTransform();
    }
  }
}
