import { IWorld } from '..';
import { TimeStep } from '../../core';
import { Vector } from '../../vectors';
import { Shape } from '../shapes';

export type ForceProcessParams = {
  shape: Shape;
  now: number;
  step: TimeStep;
  position: Vector;
  velocity: Vector;
  angle: number;
  angularVelocity: number;
};

export interface ForceSource {
  startTime: number;
  endTime: number;
  shape?: Shape;

  initialize(world: IWorld): void;
  finalize(world: IWorld): void;
  isActive(time: number): boolean;
  isExpired(time: number): boolean;

  process(params: ForceProcessParams): void;
}
