import { CanvasContext, Viewport } from '.';
import { TimeStep } from '../core';
import { Bounds } from '../misc';
import { ShapePair } from './collision';
import { Integrator } from './integrators';
import { Shape } from './shapes';

export class World {
  constructor(bounds: Bounds) {
    this.bounds = bounds;
  }

  protected _shapes: Shape[] = [];
  protected _pairs: ShapePair[] = [];
  protected _integrators: Integrator[] = [];

  readonly bounds: Bounds;
  view?: Viewport;

  clear() {
    this._shapes.splice(0);
    this._pairs.splice(0);
    this._integrators.splice(0);
  }

  add(shape: Shape) {
    this._shapes.forEach(existing => this._pairs.push(new ShapePair(shape, existing)));
    this._shapes.push(shape);
    this._integrators.push(...shape.integrators);
  }

  remove(shape: Shape) {
    this._shapes.remove(shape);
    shape.integrators.forEach(integrator => this._integrators.remove(integrator));
    const pairs = this._pairs;

    for (let i = this._pairs.length - 1; i >= 0; i--) {
      const pair = pairs[i];

      if (pair.shapeA === shape || pair.shapeB === shape)
        pairs.remove(pair);
    }
  }

  createView(ctx: CanvasContext, viewBounds?: Bounds, screenBounds?: Bounds) {
    viewBounds || (viewBounds = this.bounds);
    screenBounds || (screenBounds = ctx.bounds);
    return new Viewport(ctx, screenBounds, viewBounds, this.bounds);
  }

  createDefaultView(ctx: CanvasContext, viewBounds?: Bounds, screenBounds?: Bounds) {
    this.view = this.createView(ctx, viewBounds, screenBounds);
  }

  update(timestep: TimeStep, now: DOMHighResTimeStamp) {
    this._integrators.forEach(integrator => integrator.integrate(now, timestep));
  }

  // @ts-ignore - unused param.
  render(timestep: TimeStep, now: DOMHighResTimeStamp, viewport?: Viewport) {
    const view = viewport || this.view;

    if (!view) return;

    view.applyTransform();

    try {
      this._shapes.forEach(shape => shape.render(view));
    } finally {
      view.restoreTransform();
    }
  }
}
