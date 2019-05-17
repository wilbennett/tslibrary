import { EaseFunction } from ".";

export class Ease {
    static linear(t: number) { return t; }
    // One nice thing about smooth/smoother step is you can apply
    // them to other eases.
    static smoothStep(t: number) { return t * t * (3 - 2 * t); }
    static smootherStep(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
    static inQuad(t: number) { return t * t; }
    static inCubic(t: number) { return t * t * t; }
    static inQuartic(t: number) { return t * t * t * t; }
    static inBack(t: number) {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    }
    static inElastic(t: number) {
        return t === 0 ? 0 : t === 1 ? 1 : (0.04 - 0.04 / t) * Math.sin(25 * t) + 1;
    }
    static inCatmullRomN84(t: number) { return catmullRom(t, -8, 4); }
    static inCatmullRom10(t: number) { return catmullRom(t, 1, 0); }
    static inCatmullRom2N1(t: number) { return catmullRom(t, 2, -1); }
    static inCatmullRom010(t: number) { return catmullRom(t, 0, 10); }
    static inCatmullRomN101(t: number) { return catmullRom(t, -10, 1); }

    static outQuad(t: number) { t = 1 - t; return 1 - (t * t); }
    static outCubic(t: number) { t = 1 - t; return 1 - (t * t * t); }
    static outQuartic(t: number) { t = 1 - t; return 1 - (t * t * t * t); }
    static outBack(t: number) {
        const s = 1.70158;
        t = 1 - t;
        return 1 - (t * t * ((s + 1) * t - s));
    }
    static outElastic(t: number) { return 0.04 * t / (--t) * Math.sin(25 * t); }
    static outCatmullRomN84(t: number) { t = 1 - t; return 1 - catmullRom(t, -8, 4); }
    static outCatmullRom10(t: number) { t = 1 - t; return 1 - catmullRom(t, 1, 0); }
    static outCatmullRom2N1(t: number) { t = 1 - t; return 1 - catmullRom(t, 2, -1); }
    static outCatmullRom010(t: number) { t = 1 - t; return 1 - catmullRom(t, 0, 10); }
    static outCatmullRomN101(t: number) { t = 1 - t; return 1 - catmullRom(t, -10, 1); }


    static inOutQuad(t: number) { return inOut(Ease.inQuad, t); }
    static inOutCubic(t: number) { return inOut(Ease.inCubic, t); }
    static inOutQuartic(t: number) { return inOut(Ease.inQuartic, t); }
    static inOutBack(t: number) { return inOut(halfBack, t); }
    static inOutElastic(t: number) { return inOut(Ease.inElastic, t); }
    static inOutCatmullRomN84(t: number) { return inOut(Ease.outCatmullRomN84, t); }
    static inOutCatmullRom10(t: number) { return inOut(Ease.outCatmullRom10, t); }
    static inOutCatmullRom2N1(t: number) { return inOut(Ease.outCatmullRom2N1, t); }
    static inOutCatmullRom010(t: number) { return inOut(Ease.outCatmullRom010, t); }
    static inOutCatmullRomN101(t: number) { return inOut(Ease.outCatmullRomN101, t); }
}

function inOut(ease: EaseFunction, t: number) {
    return t < 0.5 ? ease(t * 2) * 0.5 : 1 - ease((1 - t) * 2) * 0.5;
}

function halfBack(t: number) {
    const s = 1.70158 * 1.525;
    return t * t * ((s + 1) * t - s);
}

function catmullRom(t: number, p0: number, p3: number) {
    const p1 = 0;
    const p2 = 1;

    return 0.5 * (
        (2 * p1)
        + (-p0 + p2) * t
        + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
        + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
    );
}
