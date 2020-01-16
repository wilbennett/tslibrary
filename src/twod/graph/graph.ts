import { Series, SeriesFunction } from '.';
import { Brush, CanvasContext, Viewport } from '..';
import { Bounds } from '../../misc';
import { dir, pos, Vector } from '../../vectors';
import { PlotMode } from './series';

export class Graph {
  protected _viewBounds: Bounds;
  protected _viewport?: Viewport;

  constructor(bounds: Bounds, gridSize: number, worldBounds?: Bounds) {
    this.bounds = bounds;
    this._gridSize = dir(gridSize, gridSize);
    this.worldBounds = worldBounds;

    this._viewCenter = pos(0, 0);
    this._viewBounds = Bounds.fromCenter(this._viewCenter, dir(1, 1), "up");
  }

  readonly bounds: Bounds;
  worldBounds?: Bounds;
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
  protected _gridSize: Vector;
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

    this._viewport = viewport;
    return viewport;
  }

  render(ctx: CanvasContext) {
    const viewport = this.getViewport(ctx);

    ctx.beginPath().withFillStyle(this.background).fillRect(this.bounds);

    viewport.applyTransform();
    const viewBounds = viewport.viewBounds;
    const left = Math.round(viewBounds.left);
    const right = Math.round(viewBounds.right);
    const top = Math.round(viewBounds.top);
    const bottom = Math.round(viewBounds.bottom);
    const width = right - left;
    const height = top - bottom;
    const count = Math.max(viewBounds.width, viewBounds.height);
    const tickInterval = this.tickInterval;

    let start = bottom - (bottom % tickInterval);
    ctx.withStrokeStyle(this.lineBrush).beginPath();

    for (let y = start; y <= top; y++) {
      ctx.line(left, y, right, y); // Horizontal.
    }

    ctx.withGlobalAlpha(this.gridLineAlpha)
      .withLineWidth(viewport.calcLineWidth(this.gridLineWidth))
      .stroke()
      .beginPath();

    start = left - (left % tickInterval);

    for (let x = start; x <= right; x++) {
      ctx.line(x, bottom, x, top); // Vertical.
    }

    ctx.withGlobalAlpha(this.gridLineAlpha)
      .withLineWidth(viewport.calcLineWidth(this.gridLineWidth))
      .stroke()
      .beginPath();

    start = bottom - (bottom % tickInterval);

    for (let y = start; y <= top; y += tickInterval) {
      ctx.line(left, y, right, y); // Horizontal.
    }

    ctx.withGlobalAlpha(this.tickAlpha).stroke().beginPath();
    start = left - (left % tickInterval);

    for (let x = start; x <= right; x += tickInterval) {
      ctx.line(x, bottom, x, top); // Vertical.
    }

    ctx.withGlobalAlpha(this.tickAlpha).stroke();
    const worldBounds = viewport.worldBounds;

    ctx.beginPath()
      .line(worldBounds.left, 0, worldBounds.right, 0)
      .line(0, worldBounds.top, 0, worldBounds.bottom)
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
    const gridScale = dir(1 / this.gridSize.x, 1 / this.gridSize.y);
    const viewBounds = Bounds.fromCenter(this._viewCenter, this.bounds.size.multO(gridScale));
    let worldBounds: Bounds;

    if (this.worldBounds)
      worldBounds = this.worldBounds;
    else {
      const worldSize = viewBounds.size.multO(this.gridSize).scale(10);
      worldBounds = Bounds.fromCenter(pos(0, 0), worldSize);
    }

    return new Viewport(ctx, this.bounds, viewBounds, worldBounds);
  }
}
