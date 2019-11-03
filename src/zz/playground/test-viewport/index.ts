import { WebColors } from '../../../colors';
import { Ease, EaseRunner, NumberEaser, PingPongEaser, RepeatEaser, SequentialEaser } from '../../../easing';
import { Bounds } from '../../../misc';
import { CanvasContext, ContextProps, Viewport } from '../../../twod';
import { UiUtils } from '../../../utils';
import { Vector, Vector2D } from '../../../vectors';

// console.clear();

const canvas = UiUtils.getCanvasElement("canvas");
canvas.width = 300;
canvas.height = 300;
const ctx = new CanvasContext(canvas);

const width = canvas.width;
const height = canvas.height;

const canvas2 = UiUtils.getCanvasElement("canvas2");
canvas2.width = width;
canvas2.height = height;
const ctx2 = new CanvasContext(canvas2);

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(0, 0, width, height);

ctx2.fillStyle = WebColors.whitesmoke;
ctx2.fillRect(0, 0, width, height);

ctx2.translate(width * 0.5, height * 0.5);

const radius = 20;
const diameter = radius * 2;
const halfWidth = width * 0.5;
const halfHeight = height * 0.5;
const origin = Vector2D.zeroPosition;
const screenCenter = Vector.create(halfWidth, halfHeight);
const screenBounds = Bounds.fromCenter(halfWidth, halfHeight, 50, 50);
const viewBounds = Bounds.fromCenter(0, 0, 50, 50);
const worldBounds = new Bounds(-halfWidth, -halfHeight, width, height);

const corner1 = Vector.create(-halfWidth + radius, -halfHeight + radius);
const corner2 = Vector.create(-halfWidth + radius, halfHeight - radius);
const corner3 = Vector.create(halfWidth - radius, halfHeight - radius);
const corner4 = Vector.create(halfWidth - radius, -halfHeight + radius);

const viewportProps: ContextProps = { strokeStyle: WebColors.black, lineWidth: 4 };
const centerProps: ContextProps = { fillStyle: WebColors.orange };
const corner1Props: ContextProps = { fillStyle: WebColors.red, strokeStyle: WebColors.red, lineWidth: 2 };
const corner2Props: ContextProps = { fillStyle: WebColors.green, strokeStyle: WebColors.green, lineWidth: 2 };
const corner3Props: ContextProps = { fillStyle: WebColors.blue, strokeStyle: WebColors.blue, lineWidth: 2 };
const corner4Props: ContextProps = { fillStyle: WebColors.black, strokeStyle: WebColors.black, lineWidth: 2 };

const viewport = new Viewport(ctx, screenBounds, viewBounds, worldBounds);
const duration = 1.5;

const scaleX = new NumberEaser(0.5, 1.5, duration * 5, Ease.linear, v =>
  viewport.viewBounds.withSize(v * screenBounds.width, viewport.viewBounds.height));

const scaleY = new NumberEaser(0.5, 1.5, duration * 5, Ease.linear, v =>
  viewport.viewBounds.withSize(viewport.viewBounds.width, v * screenBounds.height));

const centerTo1SX = new NumberEaser(screenCenter.x, screenBounds.halfSize.x, duration, Ease.linear, v =>
  viewport.screenBounds.withCenter(v, viewport.screenBounds.centerY));

const centerTo1SY = new NumberEaser(screenCenter.y, screenBounds.halfSize.y, duration, Ease.linear, v =>
  viewport.screenBounds.withCenter(viewport.screenBounds.centerX, v));

const c1ToC2SX = new NumberEaser(screenBounds.halfSize.x, screenBounds.halfSize.x, duration, Ease.linear, v =>
  viewport.screenBounds.withCenter(v, viewport.screenBounds.centerY));

const c1ToC2SY = new NumberEaser(screenBounds.halfSize.y, height - screenBounds.halfSize.y, duration, Ease.linear, v =>
  viewport.screenBounds.withCenter(viewport.screenBounds.centerX, v));

const c2ToCSX = new NumberEaser(screenBounds.halfSize.x, screenCenter.x, duration, Ease.linear, v =>
  viewport.screenBounds.withCenter(v, viewport.screenBounds.centerY));

const c2ToCSY = new NumberEaser(height - screenBounds.halfSize.y, screenCenter.y, duration, Ease.linear, v =>
  viewport.screenBounds.withCenter(viewport.screenBounds.centerX, v));

const centerTo1VX = new NumberEaser(origin.x, corner1.x - diameter, duration, Ease.linear, v =>
  viewport.viewBounds.withCenter(v, viewport.viewBounds.centerY));

const centerTo1VY = new NumberEaser(origin.y, corner1.y - diameter, duration, Ease.linear, v =>
  viewport.viewBounds.withCenter(viewport.viewBounds.centerX, v));

const c1ToC2VX = new NumberEaser(corner1.x - diameter, corner2.x - diameter, duration, Ease.linear, v =>
  viewport.viewBounds.withCenter(v, viewport.viewBounds.centerY));

const c1ToC2VY = new NumberEaser(corner1.y - diameter, corner2.y + diameter, duration, Ease.linear, v =>
  viewport.viewBounds.withCenter(viewport.viewBounds.centerX, v));

const c2ToCVX = new NumberEaser(corner2.x - diameter, origin.x, duration, Ease.linear, v =>
  viewport.viewBounds.withCenter(v, viewport.viewBounds.centerY));

const c2ToCVY = new NumberEaser(corner2.y + diameter, origin.y, duration, Ease.linear, v =>
  viewport.viewBounds.withCenter(viewport.viewBounds.centerX, v));

const easesX = new RepeatEaser(new SequentialEaser([
  centerTo1SX,
  c1ToC2SX,
  c2ToCSX,
  centerTo1VX,
  c1ToC2VX,
  c2ToCVX
]), Infinity);

const easesY = new RepeatEaser(new SequentialEaser([
  centerTo1SY,
  c1ToC2SY,
  c2ToCSY,
  centerTo1VY,
  c1ToC2VY,
  c2ToCVY
]), Infinity);

const runner = new EaseRunner();
runner.add(new RepeatEaser(new PingPongEaser(scaleX), Infinity));
runner.add(new RepeatEaser(new PingPongEaser(scaleY), Infinity));
runner.add(easesX);
runner.add(easesY);
runner.start();

drawPattern(ctx2);
requestAnimationFrame(loop);

function loop() {
  requestAnimationFrame(loop);

  ctx.beginPath().withFillStyle("whitesmoke").fillRect(ctx.bounds);
  drawViewport(ctx);

  viewport.resetTransform();
  viewport.applyTransform();
  drawPattern(ctx);
  ctx.beginPath().withFillStyle("purple").rect(Bounds.fromCenter(corner1, Vector.create(10, 10))).fill();
  ctx.beginPath().withFillStyle("black").fillRect(Bounds.fromCenter(Vector.create(-170, 0), Vector.create(30, 30)));
  viewport.restoreTransform();
}

function drawPattern(ctx: CanvasContext) {
  ctx.beginPath()
    .withProps(corner1Props)
    .line(origin, corner1)
    .stroke();

  ctx.beginPath()
    .withProps(corner2Props)
    .line(origin, corner2)
    .stroke();

  ctx.beginPath()
    .withProps(corner3Props)
    .line(origin, corner3)
    .stroke();

  ctx.beginPath()
    .withProps(corner4Props)
    .line(origin, corner4)
    .stroke();

  ctx.setLineDash([2, 2]);

  ctx.beginPath()
    .withProps(corner1Props)
    .line(corner1, corner2)
    .stroke();

  ctx.setLineDash([4, 2, 2, 2]);

  ctx.beginPath()
    .withProps(corner2Props)
    .line(corner2, corner3)
    .stroke();

  ctx.setLineDash([5, 1, 1, 1]);

  ctx.beginPath()
    .withProps(corner3Props)
    .line(corner3, corner4)
    .stroke();

  ctx.setLineDash([4, 2, 4, 2]);

  ctx.beginPath()
    .withProps(corner4Props)
    .line(corner4, corner1)
    .stroke();

  ctx.setLineDash([]);

  ctx.beginPath()
    .withProps(centerProps)
    .fillCircle(origin, radius);

  ctx.beginPath()
    .withProps(corner1Props)
    .fillCircle(-halfWidth + radius, -halfHeight + radius, radius);

  ctx.beginPath()
    .withProps(corner2Props)
    .fillCircle(corner2, radius);

  ctx.beginPath()
    .withProps(corner3Props)
    .fillCircle(corner3, radius);

  ctx.beginPath()
    .withProps(corner4Props)
    .fillCircle(corner4, radius);
}

function drawViewport(ctx: CanvasContext) {
  ctx.beginPath()
    .withProps(viewportProps)
    .strokeRect(screenBounds);
}
