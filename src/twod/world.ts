import { CanvasContext, Viewport } from '.';
import { TimeStep } from '../core';
import { Bounds } from '../misc';
import { BroadPhase, Contact, NarrowPhase, ShapePair, ShapePairManager } from './collision';
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
  collidingPairs: ShapePair[] = [];
  contacts: Contact[] = [];

  clear() {
    this._shapes.splice(0);
    this._pairManager.clear();
  }

  add(shape: Shape) {
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
    this.collidingPairs = [];
    this.contacts = [];
    const broadPhase = this.broadPhase;
    const narrowPhase = this.narrowPhase;

    this.collidingPairs = broadPhase
      ? broadPhase.execute(this._shapes, this._pairManager)
      : this._pairManager.pairs;

    narrowPhase && (this.contacts = narrowPhase.execute(this.collidingPairs));

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
