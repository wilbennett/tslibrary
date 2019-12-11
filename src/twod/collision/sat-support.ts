import { Collider, ColliderBase, Contact, ContactPoint, ShapePair } from '.';
import { Tristate } from '../../core';
import { Shape, ShapeAxis, SupportPoint, SupportPointImpl } from '../shapes';

export class SATSupportState {
  protected _axes?: ShapeAxis[];
  get axes() { return this._axes || (this._axes = []); }
  set axes(value) { this._axes = value; }
  startIndex = 0;
  unsupported?: boolean;
}

export class SATSupport extends ColliderBase {
  constructor(fallback?: Collider) {
    super(fallback);
  }

  protected isCollidingCore(shapes: ShapePair): boolean | undefined {
    const { shapeA: first, shapeB: second } = shapes;
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;

    const axes = this.getAxes(first, second, state);
    const count = axes.length;

    if (count === 0) return undefined;

    let support = new SupportPointImpl(first);
    let index = state.startIndex;

    for (let i = 0; i < count; i++) {
      const axis = axes[index];

      const success = axis.shape === first
        ? second.getSupportFromAxis(axis.toWorldWithShape(second, true), support)
        : first.getSupportFromAxis(axis.toWorldWithShape(first, true), support);

      if (!success) return undefined;

      if (support.distance < 0) { // Separating axis.
        state.startIndex = index;
        return false;
      }

      index = (index + 1) % count;
    }

    return true;
  }

  // @ts-ignore - unused param.
  protected calcContactCore(shapes: ShapePair, result: Contact, calcDistance: boolean): Tristate<Contact> {
    const { shapeA: first, shapeB: second } = shapes;
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;

    const axes = this.getAxes(first, second, state);
    const count = axes.length;

    if (count === 0) return undefined;

    let bestSupport: SupportPoint;
    let bestAxis = axes[0];
    let bestDistance = Infinity;
    let index = state.startIndex;

    for (let i = 0; i < count; i++) {
      const axis = axes[index];

      const support = axis.shape === first
        ? second.getSupportFromAxis(axis.toWorldWithShape(second, true))
        : first.getSupportFromAxis(axis.toWorldWithShape(first, true));

      if (!support) return undefined;

      if (support.distance < 0) { // Separating axis.
        state.startIndex = index;
        return null;
      }

      if (support.distance < bestDistance) {
        bestDistance = support.distance;
        bestSupport = support;
        bestAxis = axis;
      }

      index = (index + 1) % count;
    }

    if (!isFinite(bestDistance)) return undefined;

    result.reset();
    result.normal = bestAxis.worldNormal;
    result.points.push(new ContactPoint(bestSupport!.worldPoint, bestDistance));
    return result;
  }

  protected getState(shapes: ShapePair) {
    let state = <SATSupportState>shapes.customData["satSupportState"];

    if (!state) {
      const { shapeA: first, shapeB: second } = shapes;
      state = new SATSupportState();
      shapes.customData["satSupportState"] = state;
      const axesA = first.getAxes();
      const axesB = second.getAxes();

      if (axesA.length === 0 && !first.hasDynamicAxes || axesB.length === 0 && !second.hasDynamicAxes) {
        state.unsupported = true;
        return state;
      }

      state.axes = [...axesA, ...axesB];
    }

    return state;
  }

  protected getAxes(first: Shape, second: Shape, state: SATSupportState) {
    const result = [...state.axes];

    if (first.hasDynamicAxes)
      result.push(...first.getDynamicAxes(second));

    if (second.hasDynamicAxes)
      result.push(...second.getDynamicAxes(first));

    result.forEach(axis => axis.clearWorldData());
    return result;
  }
}
