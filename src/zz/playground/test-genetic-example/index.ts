import { AnimationLoop } from '../../../animation';
import { MathEx, TimeStep } from '../../../core';
import { EaseRunner } from '../../../easing';
import { UiUtils } from '../../../utils';

// console.clear();

const elPause = UiUtils.getInputElement("pause");
const elStepping = UiUtils.getInputElement("stepping");
const elStep = UiUtils.getInputElement("step");

// const colors: Brush[] = [
//   "red",
//   "orange",
//   "yellow",
//   "green",
//   "blue",
//   "indigo",
//   "violet",
//   "black",
// ];

MathEx.epsilon = 0.0001;
const pauseAfterSeconds = Infinity;//30;
let stepping = elStepping.checked;

const fps = 60;
let frame = -1;
const loop = new AnimationLoop(update);
const runner = new EaseRunner(loop);

loop.start();
runner.start();

elPause.addEventListener("change", () => {
  if (elPause.checked)
    loop.stop();
  else
    loop.start();

  setStepping(false);
});

elStep.addEventListener("click", () => step());
elStepping.addEventListener("change", () => stepping = elStepping.checked);

// @ts-ignore - unused param.
function update(now: DOMHighResTimeStamp, timestep: TimeStep) {
  ++frame === (fps * pauseAfterSeconds) && pause();
  stepping && pause();

}

function setStepping(value: boolean) {
  stepping = value;
  elStepping.checked = value;
}

function pause() {
  loop.stop();
  elPause.checked = true;
}

function step() {
  setStepping(true);

  if (loop.active) return;

  loop.start();
}
