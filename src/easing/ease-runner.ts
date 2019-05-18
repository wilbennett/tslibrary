import { Easer, EaserCallback } from '.';
import { AnimationLoop } from '../animation';

export class EaseRunner {
    private _easers: Easer[] = [];
    private _onRemoveListeners: EaserCallback[] = [];
    private _isLoopOwner = false;

    constructor(loop?: AnimationLoop) {
        if (!loop) {
            loop = new AnimationLoop();
            this._isLoopOwner = true;
        }

        this._loop = loop;
    }

    private static _instance: EaseRunner = new EaseRunner(new AnimationLoop());
    static get instance(): EaseRunner { return this._instance; }
    static set instance(value: EaseRunner) { this._instance = value; }

    isPaused = false;

    private _isActive = false;
    get isActive() { return this._isActive; }

    private _loop: AnimationLoop;
    get loop(): AnimationLoop { return this._loop; }
    set loop(value: AnimationLoop) {
        if (this._loop) {
            this._loop.removeOnUpdate(this.update);
        }

        this._loop = value;

        if (this.isActive)
            this._loop.onUpdate(this.update);
    }

    add(...easers: Easer[]) { this._easers.push(...easers); }

    remove(easer: Easer) {
        const index = this._easers.findIndex(x => x === easer);

        if (index < 0) return;

        this._easers.splice(index, 1);
        this._onRemoveListeners.forEach(listener => listener(easer));
    }

    start() {
        if (this._isActive) return;

        this._isActive = true;
        this._loop.onUpdate(this.update);

        if (!this._loop.active)
            this._loop.start();
    }

    stop() {
        if (!this._isActive) return;

        this._isActive = false;
        this._loop.removeOnUpdate(this.update);
        this.removeEasers(this._easers.slice());

        if (this._isLoopOwner)
            this._loop.stop();
    }

    onRemove(listener: EaserCallback) { this._onRemoveListeners.push(listener); }

    removeOnRemove(listener: EaserCallback) {
        const index = this._onRemoveListeners.findIndex(x => x === listener);

        if (index < 0) return;

        this._onRemoveListeners.splice(index, 1);
    }

    private update = () => {
        if (this.isPaused) return;

        const toRemove: Easer[] = [];

        this._easers.forEach(easer => {
            if (!easer.moveNext())
                toRemove.push(easer);
        });

        this.removeEasers(toRemove);
    }

    private removeEasers(easers: Easer[]) {
        easers.forEach(easer => this.remove(easer));
    }
}
