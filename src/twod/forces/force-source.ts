import { IWorld } from '..';
import { TimeStep } from '../../core';
import { Vector } from '../../vectors';
import { Shape } from '../shapes';


export interface ForceSource {
  startTime: number;
  endTime: number;

  initialize(world: IWorld): void;
  finalize(world: IWorld): void;
  isActive(time: number): boolean;
  isExpired(time: number): boolean;

  process(
    shape: Shape,
    now: number,
    step: TimeStep,
    position: Vector,
    velocity: Vector,
    angle: number,
    angularVelocity: number): void;
}
