import { Shape } from './shapes';

export interface IWorld {
  add(shape: Shape): void;
  remove(shape: Shape): void;
}
