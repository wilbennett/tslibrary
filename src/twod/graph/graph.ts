import { Series, SeriesFunction } from '.';
import { Brush, CanvasContext, Viewport } from '..';
import { Bounds } from '../../misc';
import { dir, pos, Vector } from '../../vectors';
import { PlotMode } from './series';

export class Graph {
  protected _viewBounds: Bounds;
  protected _viewport?: Viewport;

  constructor(bounds: Bounds, gridSize: number) {
    this.bounds = bounds;
    this._gridSize = gridSize;

    this._viewCenter = pos(0, 0);
    this._viewBounds = Bounds.fromCenter(this._viewCenter, dir(1, 1), "up");
  }

  readonly bounds: Bounds;
  tickInterval = 5;
  gridLineAlpha = 0.2;
  tickAlpha = 0.5;
  gridAlpha = 1;
  gridLineWidth = 1;
  axisWidth = 2;
  axisOrientationWidth = 3;
  background: Brush = "whitesmoke";
  lineBrush: Brush = "black";

  get range() { return this._viewBounds; }
  protected _gridSize: number;
  get gridSize() { return this._gridSize; }
  set gridSize(value) {
    this._gridSize = value;
    this.reset();
  }
  protected _viewCenter: Vector;
  get viewCenter() { return this._viewCenter; }
  set viewCenter(value) {
    this._viewCenter.withXY(value.x, value.y);
    this._viewport = undefined;
  }

  protected readonly _seriesList: Series[] = [];
  get seriesList() { return this._seriesList; }

  reset() {
    this._viewport = undefined;
  }

  addSeries(name: string, seriesFunction: SeriesFunction) {
    const series = new Series(name, seriesFunction);
    series.startX = this._viewBounds.left;
    series.endX = this._viewBounds.right;
    this._seriesList.push(series);
    return series;
  }

  removeSeries(series: Series) {
    this._seriesList.remove(series);
  }

  getViewport(ctx: CanvasContext) {
    const viewport = this._viewport || this.createViewport(ctx);

    if (viewport.ctx !== ctx)
      viewport.ctx = ctx;

    viewport.worldBounds.withSize(viewport.viewBounds.size.scaleO(10));
    this._viewport = viewport;
    return viewport;
  }

  render(ctx: CanvasContext) {
    const viewport = this.getViewport(ctx);

    ctx.beginPath().withFillStyle(this.background).fillRect(this.bounds);

    viewport.applyTransform();
    const viewBounds = viewport.viewBounds;
    const left = viewBounds.left;
    const right = viewBounds.right;
    const top = viewBounds.top;
    const bottom = viewBounds.bottom;
    const width = right - left;
    const height = top - bottom;
    const count = Math.max(viewBounds.width, viewBounds.height);
    const tickInterval = this.tickInterval;

    ctx.withStrokeStyle(this.lineBrush).beginPath();

    for (let coord = 1; coord <= count; coord++) {
      const coord2 = coord * 2;
      ctx.rect(left, -coord, width, coord2) // Horizontal.
        .rect(-coord, bottom, coord2, height); // Vertical.
    }

    ctx.withGlobalAlpha(this.gridLineAlpha)
      .withLineWidth(viewport.calcLineWidth(this.gridLineWidth))
      .stroke()
      .beginPath();

    for (let coord = tickInterval; coord <= count; coord += tickInterval) {
      const coord2 = coord * 2;
      ctx.rect(left, -coord, width, coord2) // Horizontal.
        .rect(-coord, bottom, coord2, height); // Vertical.
    }

    ctx.withGlobalAlpha(this.tickAlpha).stroke();

    ctx.beginPath()
      .line(left, 0, right, 0)
      .line(0, top, 0, bottom)
      .withGlobalAlpha(this.gridAlpha)
      .withLineWidth(viewport.calcLineWidth(this.axisWidth))
      .stroke();

    ctx.beginPath()
      .line(0, 0, 0.5, 0)
      .line(0, 0, 0, 0.5)
      .withLineWidth(viewport.calcLineWidth(this.axisOrientationWidth))
      .stroke();

    this.renderSeriesList(ctx, viewport);
    viewport.restoreTransform();
  }

  protected renderSeriesList(ctx: CanvasContext, viewport: Viewport) {
    const origLineDash = ctx.getLineDash();

    for (let series of this.seriesList) {
      const points = series.points;
      const props = series.props;
      let lineWidth = viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);

      ctx.setLineDash(series.lineDash);
      ctx.withProps(series.props).withLineWidth(lineWidth);

      if (series.plotMode === PlotMode.line) {
        ctx.beginPath().moveTo(points[0]);

        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i]);
        }

        ctx.stroke();
      } else {
        for (let i = 0; i < points.length; i++) {
          ctx.beginPath().circle(points[i], series.dotRadius);
          series.dotFill && ctx.fill();
          ctx.stroke();
        }
      }
    }

    ctx.setLineDash(origLineDash);
  }

  protected createViewport(ctx: CanvasContext) {
    const gridScale = 1 / this.gridSize;
    const viewBounds = Bounds.fromCenter(this._viewCenter, this.bounds.size.scaleO(gridScale));
    return new Viewport(ctx, this.bounds, viewBounds);
  }
}
