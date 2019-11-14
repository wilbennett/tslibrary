import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { CanvasContext, ContextProps, Graph } from '../../../twod';
import { UiUtils } from '../../../utils';
import { Vector } from '../../../vectors';

const { ONE_DEGREE } = MathEx;

// console.clear();

const canvas = UiUtils.getCanvasElement("canvas");
canvas.width = 300;
canvas.height = 300;
const ctx = new CanvasContext(canvas);

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(ctx.bounds);

const screenBounds = ctx.bounds;
const origin = Vector.createPosition(0, 0);
const gridSize = 50;
let angle = 0;
const duration = 5;
Vector.tipDrawHeight = 0.2;

const graph = new Graph(ctx.bounds, gridSize);
const vector1 = Vector.createPosition(1, 0);
const vector2 = Vector.createDirection(-2, 0);
const vector3 = vector2.normalizeO();

const vector1Props = { strokeStyle: "red", fillStyle: "red" };
const vector2Props = { strokeStyle: "green", fillStyle: "green" };
const vector3Props = { strokeStyle: "blue", fillStyle: "blue" };

const vectors: [Vector, ContextProps][] = [
  [vector1, vector1Props],
  [vector2, vector2Props],
  [vector3, vector3Props],
];

const rotate1 = new NumberEaser(0, 360, duration * 2, Ease.smoothStep, v => {
  vector1.withRadiansMag(v * ONE_DEGREE, vector1.mag);
});
const rotate2 = new NumberEaser(0, 360, duration, Ease.smoothStep, v => {
  vector2.withRadiansMag(v * ONE_DEGREE, vector2.mag);
  vector2.normalizeO(vector3);
});

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(
  rotate1.pingPong().repeat(Infinity),
  rotate2.pingPong().repeat(Infinity),
);

loop.start();
runner.start();

function render() {
  ctx.beginPath().withFillStyle("grey").fillRect(ctx.bounds);

  ctx
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());

  graph.render(ctx);

  const viewport = graph.getViewport(ctx);
  viewport.applyTransform();

  vectors.forEach(([vector, props]) => vector.render(viewport, origin, props));
  viewport.restoreTransform();

  ctx.restore();
}
