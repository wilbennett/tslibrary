export type EaseFunction = (t: number) => number;

export class EaseInfo {
    constructor(public readonly name: string, public readonly ease: EaseFunction) {
    }
}
