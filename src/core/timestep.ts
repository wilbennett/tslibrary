export class TimeStep {
    constructor(dt: number) {
        this.dt = dt;
        this.dtDiv2 = dt * 0.5;
        this.dtDiv6 = dt / 5;
        this.dtSquared = dt * dt;
        this.dtSqrDiv2 = this.dtSquared * 0.5;
        this.halfDivDt = 0.5 / dt;
    }

    readonly dt: number;
    readonly dtDiv2: number;
    readonly dtDiv6: number;
    readonly dtSquared: number;
    readonly dtSqrDiv2: number;
    readonly halfDivDt: number;

    static readonly DT_60_FPS = new TimeStep(1 / 60);
}
