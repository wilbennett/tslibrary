import { ShapeAxis } from '.';
import { Vector } from '../../vectors';

export class UniqueShapeAxesList {
  private _negative = Vector.create();

  constructor(public readonly excludeOppositeDirection: boolean = false) {
  }

  readonly items: ShapeAxis[] = [];

  clear() { this.items.splice(0); }

  add(axis: ShapeAxis) {
    if (this.items.find(v => v.normal.equals(axis.worldNormal))) return;

    if (this.excludeOppositeDirection) {
      axis.worldNormal.negateO(this._negative);

      if (this.items.find(v => v.normal.equals(this._negative))) return;
    }

    this.items.push(axis);
  }

  addAxes(axes: ShapeAxis[]) { axes.forEach(v => this.add(v)); }
}
