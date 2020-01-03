import { SteeringAction } from '.';
import { ForceProcessParams } from '..';
import { FlowField } from '../../../flow-fields';
import { dir, Vector } from '../../../vectors';
import { ShapePair } from '../../collision';

const desired = dir(0, 0);
const localPosition = dir(0, 0);
const shapeOffset = dir(0, 0);

export class Flow extends SteeringAction {
  flowField?: FlowField;

  protected calcDesiredVelocity(params: ForceProcessParams) {
    const { shape, position } = params;

    if (!this.flowField) return Vector.empty;
    if (!this._shape) return Vector.empty;
    if (!this.collider) return Vector.empty;

    // TODO: Use ShapePairManager to cache.
    const pair = new ShapePair(this._shape, shape);
    this.collider.calcContact(pair);
    const contact = pair.contact;

    if (!contact.isCollision) return Vector.empty;

    this._shape.toLocal(position, localPosition);
    this.flowField.boundsSize.scaleO(0.5, shapeOffset);
    localPosition.add(shapeOffset);
    const vector = this.flowField.getVectorForPoint(localPosition);

    if (!vector || vector.isEmpty) return Vector.empty;

    return desired.copyFrom(vector).normalizeScale(this._maxSpeed);
  }
}
