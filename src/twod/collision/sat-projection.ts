import { Collider, ColliderBase, Contact, ContactPoint, ShapePair } from '.';
import { Tristate } from '../../core';
import { Projection, Shape, ShapeAxis, UniqueShapeAxesList } from '../shapes';

export class SATProjectionState {
  protected _axes?: ShapeAxis[];
  get axes() { return this._axes || (this._axes = []); }
  set axes(value) { this._axes = value; }
  startIndex = 0;
  unsupported?: boolean;
}

export class SATProjection extends ColliderBase {
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

    let index = state.startIndex;
    const projectionA = new Projection();
    const projectionB = new Projection();

    for (let i = 0; i < count; i++) {
      const axis = axes[index].worldNormal;

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


  // @ts-ignore - unused param.
  protected calcContactCore(shapes: ShapePair, result: Contact, calcDistance: boolean): Tristate<Contact> {
    let shapeA: Shape;
    let shapeB: Shape;

    // If circle vs other, prefer contact point on circle.
    if (shapes.shapeA.kind !== "circle" && shapes.shapeB.kind === "circle") {
      shapeA = shapes.shapeB;
      shapeB = shapes.shapeA;
    } else {
      shapeA = shapes.shapeA;
      shapeB = shapes.shapeB;
    }

    const state = this.getState(shapes);

    if (state.unsupported) return undefined;

    const axes = this.getAxes(shapeA, shapeB, state);
    const count = axes.length;

    if (count === 0) return undefined;

    let index = state.startIndex;
    let minOverlap = Infinity;
    let minAxis = axes[index].worldNormal;
    const projectionA = new Projection();
    const projectionB = new Projection();
    let point = projectionA.minPoint;

    for (let i = 0; i < count; i++) {
      const axis = axes[index].worldNormal;

      if (!shapeA.projectOn(axis, projectionA) || !shapeB.projectOn(axis, projectionB)) return undefined;

      let overlap = projectionA.calcOverlap(projectionB);

      if (overlap < 0) { // Separating axis.
        state.startIndex = index;
        return null;
      }

      if (projectionA.isContainment(projectionB))
        overlap = projectionB.max - projectionA.min;

      if (overlap < minOverlap) {
        minOverlap = overlap;

        if (projectionA.min < projectionB.min) {
          minAxis = axis.negateO();
          point = projectionA.maxPoint;
        } else {
          minAxis = axis;
          point = projectionA.minPoint;
        }
      }

      index = (index + 1) % count;
    }

    result.reset();
    result.normal = minAxis;
    result.points.push(new ContactPoint(point, minOverlap));
    return result;
  }

  protected getState(shapes: ShapePair) {
    let state = <SATProjectionState>shapes.customData["satProjectionState"];

    if (!state) {
      const { shapeA: first, shapeB: second } = shapes;
      state = new SATProjectionState();
      shapes.customData["satProjectionState"] = state;
      const axesA = first.getAxes();
      const axesB = second.getAxes();

      if (axesA.length === 0 && !first.hasDynamicAxes || axesB.length === 0 && !second.hasDynamicAxes) {
        state.unsupported = true;
        return state;
      }

      const axesList = new UniqueShapeAxesList(true);
      axesList.addAxes(axesA);
      axesList.addAxes(axesB);
      state.axes = axesList.items;
    }

    return state;
  }

  protected getAxes(first: Shape, second: Shape, state: SATProjectionState) {
    const axesList = new UniqueShapeAxesList(true);
    axesList.addAxes(state.axes);

    if (first.hasDynamicAxes)
      axesList.addAxes(first.getDynamicAxes(second));

    if (second.hasDynamicAxes)
      axesList.addAxes(second.getDynamicAxes(first));

    return axesList.items;
  }
}
