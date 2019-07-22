export class MassInfo {
    constructor(mass: number, inertia: number) {
        this.mass = mass;
        this.inertia = inertia;
        this.massInverse = mass !== 0 ? 1 / mass : 0;
        this.inertiaInverse = inertia !== 0 ? 1 / inertia : 0;
    }

    readonly mass: number;
    readonly massInverse: number;
    readonly inertia: number;
    readonly inertiaInverse: number;

    static readonly empty = new MassInfo(0, 0);
}
