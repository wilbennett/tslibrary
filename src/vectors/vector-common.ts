import { Vector1B, Vector1D, Vector2B, Vector2D, Vector3B, Vector3D } from '.';

export type VectorClass = typeof Vector1D | typeof Vector2D | typeof Vector3D;
export type VectorBClass = typeof Vector1B | typeof Vector2B | typeof Vector3B;
