export type AnimCallback = (now: DOMHighResTimeStamp, timestep: number) => void;

export class AnimationLoop {
  private _active: boolean = false;
  protected _priorNow: number = 0;
  protected _secondsToUpdate: number = 0;
  protected _updaters: AnimCallback[] = [];
  protected _renderers: AnimCallback[] = [];

  constructor(onUpdate?: AnimCallback, onRender?: AnimCallback) {
    if (onUpdate)
      this._updaters.push(onUpdate);

    if (onRender)
      this._renderers.push(onRender);
  }

  now: number = 0;
  readonly fps = 60;
  readonly secondsPerFrame = 1 / this.fps;
  get active() { return this._active; }

  start() {
    if (this._active) return;

    this._active = true;
    requestAnimationFrame(this.initLoop);
  }

  stop() {
    if (!this._active) return;

    this._active = false;
  }

  onUpdate(updater: AnimCallback) { this._updaters.push(updater); }
  onRender(renderer: AnimCallback) { this._renderers.push(renderer); }

  removeOnUpdate(updater: AnimCallback) {
    const index = this._updaters.findIndex(u => u === updater);

    if (index < 0) return;

    this._updaters.splice(index, 1);
  }

  removeOnRender(renderer: AnimCallback) {
    const index = this._renderers.findIndex(u => u === renderer);

    if (index < 0) return;

    this._renderers.splice(index, 1);
  }

  protected initLoop = (timestamp: DOMHighResTimeStamp) => {
    requestAnimationFrame(this.loop);

    const now = timestamp / 1000;
    this._priorNow = now;
  }

  protected loop = (timestamp: DOMHighResTimeStamp) => {
    if (!this._active) return;

    requestAnimationFrame(this.loop);

    const now = timestamp / 1000;
    const elapsed = now - this._priorNow;
    this._secondsToUpdate += elapsed;
    this._priorNow = now;

    // We got called back too early (and not enough prior time to offset)... wait until the next call.
    if (this._secondsToUpdate < this.secondsPerFrame) return;

    // Adjust to the start of the updates.
    this.now = now - this._secondsToUpdate;

    // Update in secondsPerFrame increments. This reduces floating point errors and allows
    // catching up on missed updates without rendering each.
    while (this._secondsToUpdate >= this.secondsPerFrame) {
      this._updaters.forEach(update => update(this.now, this.secondsPerFrame));

      this._secondsToUpdate -= this.secondsPerFrame;
      this.now += this.secondsPerFrame;
    }

    this._renderers.forEach(render => render(this.now, this.secondsPerFrame));
  }
}
