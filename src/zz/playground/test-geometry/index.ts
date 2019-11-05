import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { CanvasContext, ContextProps, Graph, Line, Segment } from '../../../twod';
import { UiUtils } from '../../../utils';
import { Vector } from '../../../vectors';

// console.clear();

const canvas = UiUtils.getCanvasElement("canvas");
canvas.width = 300;
canvas.height = 300;
const ctx = new CanvasContext(canvas);

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(ctx.bounds);

const screenBounds = ctx.bounds;
const gridSize = 50;
let angle = 0;
const duration = 5;

const graph = new Graph(ctx.bounds, gridSize);
const line1 = new Line(Vector.createPosition(0.5, 0), Vector.createDirection(1, 1));
const line2 = new Line(Vector.createPosition(-0.5, 2), Vector.createDirection(1, -2));
const segment1 = new Segment(Vector.createPosition(-1, 1), Vector.createPosition(1, -1));
const segment2 = new Segment(Vector.createPosition(1, -2), Vector.createPosition(2, 0));

const line1Props: ContextProps = { strokeStyle: "blue" };
const line2Props: ContextProps = { strokeStyle: "purple" };
const segment1Props: ContextProps = { strokeStyle: "red" };
const segment2Props: ContextProps = { strokeStyle: "green" };

// const scale = new NumberEaser(5, 40, duration, Ease.outCatmullRom2N1, v => graph.gridSize = v);
// const rotate = new NumberEaser(0, 360, duration * 5, Ease.smoothStep, v => angle = v);
const lineRotate = new NumberEaser(0, 360, duration * 5, Ease.smoothStep, _ => {
  line1.direction.rotateOneDegree();
  line2.direction.rotateNegativeOneDegree();
});

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(
  // scale.pingPong().repeat(Infinity),
  // rotate.pingPong().repeat(Infinity),
  lineRotate.repeat(Infinity),
);

loop.start();
runner.start();

function render() {
  ctx.beginPath().withFillStyle("grey").fillRect(ctx.bounds);

  ctx
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateN());

  graph.render(ctx);

  const viewport = graph.getViewport(ctx);
  viewport.applyTransform();
  line1.render(viewport, line1Props);
  line2.render(viewport, line2Props);
  segment1.render(viewport, segment1Props);
  segment2.render(viewport, segment2Props);
  viewport.restoreTransform();

  ctx.restore();
}
