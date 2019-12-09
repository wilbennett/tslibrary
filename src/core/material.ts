export type Material = {
  readonly name: string;
  restitution: number;
  density: number;
  staticFriction: number;
  kineticFriction: number;
};

export const DEFAULT_MATERIAL: Material = Object.freeze({
  name: "default",
  restitution: 0.2,
  density: 0,
  staticFriction: 0.5,
  kineticFriction: 0.3
});
