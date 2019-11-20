import { ColliderBase, ShapePair } from '.';

export class GjkState {
  unsupported?: boolean;
}

export class Simplex {
  
}

export class Gjk extends ColliderBase {

  protected getState(shapes: ShapePair) {
    let state = <GjkState>shapes.customData["gjkState"];

    if (!state) {
      // const { first, second } = shapes;
      state = new GjkState();
      shapes.customData["gjkState"] = state;
    }

    return state;
  }
}
