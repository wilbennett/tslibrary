import { Collider, ColliderBase, Contact, ContactPoint, ShapePair } from '.';
import { Tristate } from '../../core';
import { Shape, ShapeAxis, SupportPoint } from '../shapes';

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
    const { first, second } = shapes;
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;

    const axes = this.getAxes(first, second, state);
    const count = axes.length;

    if (count === 0) return undefined;

    let support = new SupportPoint(first);
    let index = state.startIndex;

    for (let i = 0; i < count; i++) {
      const axis = axes[index];

      const success = axis.shape === first
        ? second.getSupport(axis.toWorldWithShape(second, true), support)
        : first.getSupport(axis.toWorldWithShape(first, true), support);

      if (!success) return undefined;

      if (support.distance < 0) { // Separating axis.
        state.startIndex = index;
        return false;
      }

      index = (index + 1) % count;
    }

    return true;
  }

  protected calcContactCore(shapes: ShapePair): Tristate<Contact> {
    const { first, second } = shapes;
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;

    const axes = this.getAxes(first, second, state);
    const count = axes.length;

    if (count === 0) return undefined;

    let support = new SupportPoint(first);
    const bestSupport = new SupportPoint(first);
    let bestAxis = axes[0];
    let bestDistance = Infinity;
    let index = state.startIndex;

    for (let i = 0; i < count; i++) {
      const axis = axes[index];

      const success = axis.shape === first
        ? second.getSupport(axis.toWorldWithShape(second, true), support)
        : first.getSupport(axis.toWorldWithShape(first, true), support);

      if (!success) return undefined;

      if (support.distance < 0) { // Separating axis.
        state.startIndex = index;
        return null;
      }

      if (support.distance < bestDistance) {
        bestDistance = support.distance;
        support.clone(bestSupport);
        bestAxis = axis;
      }

      index = (index + 1) % count;
    }

    const contact = shapes.contact;
    contact.reset();

    if (bestAxis.shape === second) {
      contact.normal = bestAxis.worldNormal;
      contact.points.push(new ContactPoint(bestSupport.worldPoint, bestDistance));
    } else {
      contact.normal = bestAxis.worldNormal.negateO();
      contact.points.push(new ContactPoint(bestAxis.worldPoint, bestDistance));
    }

    return contact;
  }

  protected getState(shapes: ShapePair) {
    let state = <SATSupportState>shapes.customData["satSupportState"];

    if (!state) {
      const { first, second } = shapes;
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

    return result;
  }
}
