import { WebColors } from '../../../colors';
import { Ease, EaseRunner, NumberEaser, SequentialEaser, VectorEaser } from '../../../easing';
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
const halfWidth = width * 0.5;
const halfHeight = height * 0.5;
const origin = Vector2D.zeroPosition;
const screenCenter = Vector.create(halfWidth, halfHeight);
const screenBounds = Bounds.fromCenter(halfWidth, halfHeight, 50, 50);
const viewBounds = Bounds.fromCenter(0, 0, 50, 50);
const worldBounds = new Bounds(-halfWidth, -halfHeight, width, height);
const inset = ctx.bounds.inflateN(screenBounds.halfSize.negateN());
const worldInset = worldBounds.inflateN(-radius, -radius);

const corner1 = worldInset.bottomLeft;
const corner2 = worldInset.bottomRight;
const corner3 = worldInset.topRight;
const corner4 = worldInset.topLeft;

const viewportProps: ContextProps = { strokeStyle: WebColors.black, lineWidth: 4 };
const centerProps: ContextProps = { fillStyle: WebColors.orange };
const corner1Props: ContextProps = { fillStyle: WebColors.red, strokeStyle: WebColors.red, lineWidth: 2 };
const corner2Props: ContextProps = { fillStyle: WebColors.green, strokeStyle: WebColors.green, lineWidth: 2 };
const corner3Props: ContextProps = { fillStyle: WebColors.blue, strokeStyle: WebColors.blue, lineWidth: 2 };
const corner4Props: ContextProps = { fillStyle: WebColors.black, strokeStyle: WebColors.black, lineWidth: 2 };

const viewport = new Viewport(ctx, screenBounds, viewBounds, worldBounds);
const duration = 1.5;

const scale = new NumberEaser(0.5, 1.5, duration * 5, Ease.linear, v =>
  viewport.viewBounds.withSize(screenBounds.size.scaleN(1 / v)));

const centerTo1S = new VectorEaser(screenCenter, screenBounds.halfSize, duration, Ease.linear, v =>
  viewport.screenBounds.withCenter(v));

const c1ToC2S = new VectorEaser(inset.topLeft, inset.bottomLeft, duration, Ease.linear, v =>
  viewport.screenBounds.withCenter(v));

const c2ToCS = new VectorEaser(inset.bottomLeft, screenCenter, duration, Ease.linear, v =>
  viewport.screenBounds.withCenter(v));

const centerTo1V = new VectorEaser(origin, worldBounds.bottomLeft, duration, Ease.linear, v =>
  viewport.viewBounds.withCenter(v));

const c1ToC2V = new VectorEaser(worldBounds.bottomLeft, worldBounds.bottomRight, duration, Ease.linear, v =>
  viewport.viewBounds.withCenter(v));

const c2ToCV = new VectorEaser(worldBounds.bottomRight, origin, duration, Ease.linear, v =>
  viewport.viewBounds.withCenter(v));

const easesV = new SequentialEaser([
  centerTo1S,
  c1ToC2S,
  c2ToCS,
  centerTo1V,
  c1ToC2V,
  c2ToCV,
]).repeat(Infinity);

const runner = new EaseRunner();
runner.add(
  scale.pingPong().repeat(Infinity),
  easesV);
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
