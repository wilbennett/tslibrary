import { ForceProcessParams, WindBase } from '.';
import { FlowField } from '../../flow-fields';
import { dir, Vector } from '../../vectors';
import { ShapePair } from '../collision';

const localPosition = dir(0, 0);
const shapeOffset = dir(0, 0);
const direction = dir(0, 0);

export class FlowWind extends WindBase {
  flowField?: FlowField;

  protected processCore(params: ForceProcessParams) {
    if (!this.flowField) return Vector.empty;
    if (!this._shape) return Vector.empty;
    if (!this.collider) return Vector.empty;

    const { shape, position } = params;

    // TODO: Use ShapePairManager to cache.
    // const pair = new ShapePair(shape, this._shape);
    const pair = new ShapePair(this._shape, shape);
    this.collider.calcContact(pair);
    const contact = pair.contact;

    if (!contact.isCollision) return Vector.empty;

    this._shape.toLocal(position, localPosition);
    this.flowField.boundsSize.scaleO(0.5, shapeOffset);
    localPosition.add(shapeOffset);
    const vector = this.flowField.getVectorForPoint(localPosition);

    if (!vector || vector.isEmpty) return Vector.empty;

    const speedSquared = vector.magSquared;
    vector.normalizeO(direction);
    return this.calculateForce(shape, contact, direction, speedSquared);
  }
}
