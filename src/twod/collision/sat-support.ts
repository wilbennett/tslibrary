import { Collider, ColliderBase, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { UniqueVectorList, Vector } from '../../vectors';
import { Shape } from '../shapes';

export class SATSupportState {
  protected _axesA?: Vector[];
  get axesA() { return this._axesA || (this._axesA = []); }
  protected _axesB?: Vector[];
  get axesB() { return this._axesB || (this._axesB = []); }
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

  protected getAxes(first: Shape, second: Shape, state: SATSupportState): Vector[] {
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
