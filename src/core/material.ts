export type Material = {
    readonly name: string;
    readonly restitution: number;
    readonly density: number;
    readonly staticFriction: number;
    readonly kineticFriction: number;
};

export const DEFAULT_MATERIAL: Material = Object.freeze({
    name: "default",
    restitution: 0.2,
    density: 0.6,
    staticFriction: 0.5,
    kineticFriction: 0.3
});
