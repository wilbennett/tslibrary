import { Collider, ColliderBase, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { Shape, ShapeAxis, UniqueShapeAxesList } from '../shapes';

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

  // @ts-ignore - unused param.
  protected isCollidingCore(shapes: ShapePair): boolean | undefined {
    return undefined;
  }

  // @ts-ignore - unused param.
  protected calcContactCore(shapes: ShapePair): Tristate<Contact> {
    return undefined;
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

      const axesList = new UniqueShapeAxesList(false);
      axesList.addAxes(axesA);
      axesList.addAxes(axesB);
      state.axes = axesList.items;
    }

    return state;
  }

  protected getAxes(first: Shape, second: Shape, state: SATSupportState) {
    const axesList = new UniqueShapeAxesList(false);
    axesList.addAxes(state.axes);

    if (first.hasDynamicAxes)
      axesList.addAxes(first.getDynamicAxes(second));

    if (second.hasDynamicAxes)
      axesList.addAxes(second.getDynamicAxes(first));

    return axesList.items;
  }
}
