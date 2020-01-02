import { AABBShape } from '.';
import { ContextProps, Viewport } from '..';
import { FlowField } from '../../flow-fields';
import { pos } from '../../vectors';

export class FlowFieldShape extends AABBShape {
  constructor(public flowField: FlowField) {
    super(flowField.boundsSize.scaleO(0.5));
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    super.renderCore(view, props);

    const ctx = view.ctx;
    const flowField = this.flowField;
    const cellSize = flowField.cellSize;
    const cellWidth = cellSize.x;
    const cellHeight = cellSize.y;
    const halfCellWidth = cellWidth * 0.5;
    const halfCellHeight = cellHeight * 0.5;
    const width = flowField.width;
    const height = flowField.height;
    const halfX = this.halfSize.x;
    const halfY = this.halfSize.y;
    const center = pos(0, 0);

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const vector = flowField.getVector(c, r);
        const rect = flowField.getCellRect(c, r);
        const minX = rect.minX - halfX;
        const minY = rect.minY - halfY;
        center.withXY(minX + halfCellWidth, minY + halfCellHeight);

        ctx.beginPath().rect(minX, minY, cellWidth, cellHeight);

        if (props.fillStyle)
          ctx.fill();

        if (props.strokeStyle)
          ctx.stroke();

        vector.render(view, center, props);
      }
    }
  }
}
