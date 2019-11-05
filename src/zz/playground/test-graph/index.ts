import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseManager, EaseRunner, NumberEaser } from '../../../easing';
import { CanvasContext, Graph, PlotMode } from '../../../twod';
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

const graph = new Graph(ctx.bounds, gridSize);
const sin = graph.addSeries("sin", Math.sin);
sin.scale = Vector.create(1, 2);
sin.lineDash = [0.5, 0.5];

const cos = graph.addSeries("cos", Math.cos);
cos.scale = Vector.create(1, 2);
cos.dotRadius = cos.step / 2;
cos.plotMode = PlotMode.dot;
cos.dotFill = true;

const ease = graph.addSeries("ease", Ease.smootherStep);
ease.scale = Vector.create(5, 5);
ease.startX = 0;
ease.endX = 1;
ease.step = 0.01;
ease.props = { strokeStyle: "green", lineWidth: 2 };

const seriesList = [sin, cos];
const duration = 5;

const scale = new NumberEaser(5, 40, duration, Ease.outCatmullRom2N1, v => graph.gridSize = v);
const rotate = new NumberEaser(0, 360, duration * 5, Ease.smoothStep, v => angle = v);
const xoffset = new NumberEaser(0, 360, duration * 0.5, Ease.smoothStep, v => {
  seriesList.forEach(series => series.offset.withX(v * MathEx.ONE_DEGREE));
}, () => ease.seriesFunction = EaseManager.getRandomEase());

const runner = new EaseRunner();
runner.add(
  scale.pingPong().repeat(Infinity),
  rotate.pingPong().repeat(Infinity),
  xoffset.pingPong().repeat(Infinity),
);
runner.start();

requestAnimationFrame(loop);

function loop() {
  requestAnimationFrame(loop);

  ctx.beginPath().withFillStyle("grey").fillRect(ctx.bounds);

  ctx
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateN());

  seriesList.forEach(series => {
    series.startX = graph.range.left - MathEx.TWO_PI;
    series.endX = graph.range.right + MathEx.TWO_PI;
  });

  graph.render(ctx);

  ctx.restore();
}
