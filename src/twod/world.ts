import { CanvasContext, Viewport } from '.';
import { TimeStep } from '../core';
import { Bounds } from '../misc';
import { ShapePairManager } from './collision';
import { Integrator } from './integrators';
import { Shape } from './shapes';

export class World {
  constructor(bounds: Bounds) {
    this.bounds = bounds;
  }

  protected _shapes: Shape[] = [];
  protected _pairManager = new ShapePairManager();
  protected _integrators: Integrator[] = [];

  readonly bounds: Bounds;
  view?: Viewport;

  clear() {
    this._shapes.splice(0);
    this._pairManager.clear();
    this._integrators.splice(0);
  }

  add(shape: Shape) {
    this._shapes.push(shape);
    this._pairManager.addShape(shape, this._shapes);
    this._integrators.push(...shape.integrators);
  }

  remove(shape: Shape) {
    this._shapes.remove(shape);
    this._pairManager.removeShape(shape);
    shape.integrators.forEach(integrator => this._integrators.remove(integrator));
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
    this._integrators.forEach(integrator => integrator.integrate(now, timestep));
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
