import { CanvasContext, Viewport } from '.';
import { TimeStep } from '../core';
import { Bounds } from '../misc';
import { BroadPhase, CollisionResolver, Contact, NarrowPhase, ShapePair, ShapePairManager } from './collision';
import { Shape } from './shapes';

export class World {
  constructor(bounds: Bounds) {
    this.bounds = bounds;
  }

  protected _shapes: Shape[] = [];
  protected _pairManager = new ShapePairManager();

  readonly bounds: Bounds;
  view?: Viewport;
  broadPhase?: BroadPhase;
  narrowPhase?: NarrowPhase;
  collisionResolver?: CollisionResolver;
  collidingPairs: ShapePair[] = [];
  contacts: Contact[] = [];

  clear() {
    this._shapes.splice(0);
    this._pairManager.clear();
  }

  add(shape: Shape) {
    if (this._shapes.includes(shape)) return;

    this._pairManager.addShape(shape, this._shapes);
    this._shapes.push(shape);
  }

  remove(shape: Shape) {
    this._shapes.remove(shape);
    this._pairManager.removeShape(shape);
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

    for (let i = 0; i < relaxationCount; i++) {
      const isLastIteration = i === lastIndex;

      collidingPairs = broadPhase
        ? broadPhase.execute(this._shapes, this._pairManager)
        : this._pairManager.pairs;

      if (collidingPairs.length === 0) break;

      narrowPhase && (contacts = narrowPhase.execute(collidingPairs));

      if (contacts.length === 0) break;

      collisionResolver && contacts.forEach(contact => collisionResolver.resolve(contact, isLastIteration));
    }

    this.collidingPairs = collidingPairs;
    this.contacts = contacts;
    this._shapes.forEach(shape => shape.integrator.integrate(now, timestep));
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
