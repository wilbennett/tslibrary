import { Collider, ColliderBase, Contact, ContactPoint, ShapePair } from '.';
import { Tristate } from '../../core';
import { UniqueVectorList, Vector } from '../../vectors';
import { Projection, Shape } from '../shapes';

export class SATProjectionState {
  protected _axesA?: Vector[];
  get axesA() { return this._axesA || (this._axesA = []); }
  protected _axesB?: Vector[];
  get axesB() { return this._axesB || (this._axesB = []); }
  startIndex = 0;
  unsupported?: boolean;
}

export class SATProjection extends ColliderBase {
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

    let index = state.startIndex;
    const projectionA = new Projection();
    const projectionB = new Projection();

    for (let i = 0; i < count; i++) {
      const axis = axes[index];

      if (!first.projectOn(axis, projectionA) || !second.projectOn(axis, projectionB)) return undefined;

      let overlap = projectionA.calcOverlap(projectionB);

      if (overlap < 0) { // Separating axis.
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

    let index = state.startIndex;
    let minOverlap = Infinity;
    let minAxis = axes[index];
    const projectionA = new Projection();
    const projectionB = new Projection();
    let point = projectionA.minPoint;
    let maxPoint = projectionA.maxPoint;
    const ba = first.position.subO(second.position);

    for (let i = 0; i < count; i++) {
      const axis = axes[index];

      if (!first.projectOn(axis, projectionA) || !second.projectOn(axis, projectionB)) return undefined;

      let overlap = projectionA.calcOverlap(projectionB);

      if (overlap < 0) { // Separating axis.
        state.startIndex = index;
        return null;
      }

      if (projectionA.isContainment(projectionB))
        overlap = projectionB.max - projectionA.min;

      if (overlap < minOverlap) {
        minOverlap = overlap;

        minAxis = axis;
        point = projectionA.minPoint;
        maxPoint = projectionA.maxPoint;
      }

      index = (index + 1) % count;
    }

    if (ba.dot(minAxis) < 0) { // Ensure normal points from second to first.
      minAxis = minAxis.negateO();
      point = maxPoint;
    }

    const contact = shapes.contact;
    contact.reset();
    contact.normal = minAxis;
    contact.points.push(new ContactPoint(point, minOverlap));
    return contact;
  }

  protected getState(shapes: ShapePair) {
    let state = <SATProjectionState>shapes.customData["satProjectionState"];

    if (!state) {
      const { first, second } = shapes;
      state = new SATProjectionState();
      shapes.customData["satProjectionState"] = state;
      const axesB = second.getAxes();
      const axesA = first.getAxes();

      if (axesA.length === 0 && !first.hasDynamicAxes || axesB.length === 0 && !second.hasDynamicAxes) {
        state.unsupported = true;
        return state;
      }

      const axesList = new UniqueVectorList(true);
      axesList.addVectors(axesA);
      state.axesA.push(...axesList.items);

      axesList.clear();
      axesList.addVectors(axesB);
      state.axesB.push(...axesList.items);
    }

    return state;
  }

  protected getAxes(first: Shape, second: Shape, state: SATProjectionState): Vector[] {
    const axesList = new UniqueVectorList(true);
    state.axesA.forEach(a => axesList.add(first.toWorld(a)));
    state.axesB.forEach(a => axesList.add(second.toWorld(a)));

    if (first.hasDynamicAxes)
      axesList.addVectors(first.getDynamicAxes(second));

    if (second.hasDynamicAxes)
      axesList.addVectors(second.getDynamicAxes(first));

    return axesList.items;
  }
}
