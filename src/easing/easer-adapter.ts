import { TypedEaser } from '.';
import { Easer } from './easer';

export class EaserAdapter extends TypedEaser<any> {
  constructor(public readonly easer: Easer) {
    super(easer.duration);
  }

  get value() { return 0; }
  get start() { return 0; }
  get end() { return 0; }
  get ease() { return this.easer.ease; }

  reset() {
    super.reset();
    this.easer.reset();
  }

  reverse() {
    super.reverse();
    this.easer.reverse();
  }

  moveNext() {
    this.advanceEaser();
    return super.moveNext();
  }

  protected advanceEaser() { this.easer.moveNext(); }
  protected calcStepAmt() { return 1 / this.calcSteps(); }
  protected calcSteps() { return this.easer.steps; }

  // @ts-ignore - unused param.
  protected calcValue(percent: number) { return 0; }
}
