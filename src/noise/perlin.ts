import { Noise } from '.';
import { MathEx } from '../core';

const { lerp } = MathEx;

export class Perlin extends Noise {
    protected static _instance: Perlin;

    constructor(
        seed?: number,
        octaves: number = 4,
        amplitude: number = 1,
        frequency: number = 1,
        lacunarity: number = 2,
        gain: number = 0.5) {
        super();

        this.seed = seed !== undefined ? seed : MathEx.seed;
        this.octaves = octaves;
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.lacunarity = lacunarity;
        this.gain = gain;
        const permutations = Array.from({ length: 256 }, (_, i) => i);
        MathEx.randomize(this.seed);

        for (let i = 0; i < 256; i++) {
            const index = MathEx.randomInt(255);
            const value = permutations[index];
            permutations[index] = permutations[i];
            permutations[i] = value;
        }

        this._permutations = permutations.concat(permutations);
    }

    readonly seed: number;

    protected _permutations: number[];
    get permutations() { return this._permutations; }
    set permutations(value) { this._permutations = value; }

    protected get lowOutput1() { return -Math.sqrt(1 / 4); }
    protected get highOutput1() { return Math.sqrt(1 / 4); }
    //*
    protected get lowOutput2() { return -Math.sqrt(2 / 4); }
    protected get highOutput2() { return Math.sqrt(2 / 4); }
    /*/
    protected get lowOutput2() { return -Math.sqrt(1 / 4); }
    protected get highOutput2() { return Math.sqrt(1 / 4); }
    //*/
    protected get lowOutput3() { return -Math.sqrt(3 / 4); }
    protected get highOutput3() { return Math.sqrt(3 / 4); }

    protected getValueCore(x: number) {
        const perm = this._permutations;
        const intVal = Math.floor(x);
        const X = intVal & 0xFF;
        x -= intVal;

        const sx = x * x * (3 - 2 * x);
        // const sx = x * x * x * (x * (x * 6 - 15) + 10);
        const u = this.grad1d(perm[X], x);
        const v = this.grad1d(perm[X + 1], x - 1);
        // console.log(`u = ${u} = this.grad1d(${perm[X]}, ${x})`);
        // console.log(`v = ${v} = this.grad1d(${perm[X + 1]}, ${x - 1})`);

        return lerp(u, v, sx);
    }

    protected getValue2DCore(x: number, y: number) {
        const perm = this._permutations;
        let intVal = Math.floor(x);
        const X = intVal & 0xFF;
        x -= intVal;

        const sx = x * x * (3 - 2 * x);
        // const sx = x * x * x * (x * (x * 6 - 15) + 10);

        intVal = Math.floor(y);
        const Y = intVal & 0xFF;
        y -= intVal;

        const sy = y * y * (3 - 2 * y);
        // const sy = y * y * y * (y * (y * 6 - 15) + 10);

        const p0 = perm[X] + Y;
        const p1 = perm[X + 1] + Y;

        const u1 = this.grad2d(perm[p0], x, y);
        const v1 = this.grad2d(perm[p1], x - 1, y);
        const u2 = this.grad2d(perm[p0 + 1], x, y - 1);
        const v2 = this.grad2d(perm[p1 + 1], x - 1, y - 1);

        const a = lerp(u1, v1, sx);
        const b = lerp(u2, v2, sx);
        return lerp(a, b, sy);
    }

    protected getValue3DCore(x: number, y: number, z: number) {
        const perm = this._permutations;
        let intVal = Math.floor(x);
        const X = intVal & 0xFF;
        x -= intVal;

        const sx = x * x * (3 - 2 * x);
        // const sx = x * x * x * (x * (x * 6 - 15) + 10);

        intVal = Math.floor(y);
        const Y = intVal & 0xFF;
        y -= intVal;

        const sy = y * y * (3 - 2 * y);
        // const sy = y * y * y * (y * (y * 6 - 15) + 10);

        intVal = Math.floor(z);
        const Z = intVal & 0xFF;
        z -= intVal;

        const sz = z * z * (3 - 2 * z);
        // const sz = z * z * z * (z * (z * 6 - 15) + 10);

        const p0 = perm[X] + Y;
        const p00 = perm[p0] + Z;
        const p01 = perm[p0 + 1] + Z;
        const p1 = perm[X + 1] + Y;
        const p10 = perm[p1] + Z;
        const p11 = perm[p1 + 1] + Z;

        const u1 = this.grad3d(perm[p00], x, y, z);
        const v1 = this.grad3d(perm[p10], x - 1, y, z);
        const u2 = this.grad3d(perm[p01], x, y - 1, z);
        const v2 = this.grad3d(perm[p11], x - 1, y - 1, z);
        const u3 = this.grad3d(perm[p00 + 1], x, y, z - 1);
        const v3 = this.grad3d(perm[p10 + 1], x - 1, y, z - 1);
        const u4 = this.grad3d(perm[p01 + 1], x, y - 1, z - 1);
        const v4 = this.grad3d(perm[p11 + 1], x - 1, y - 1, z - 1);

        const a = lerp(u1, v1, sx);
        const b = lerp(u2, v2, sx);
        const c = lerp(u3, v3, sx);
        const d = lerp(u4, v4, sx);

        const e = lerp(a, b, sy);
        const f = lerp(c, d, sy);

        return lerp(e, f, sz);
    }

    static get octaves() { this.ensureInstance(); return this._instance.octaves; }
    static set octaves(value) { this.ensureInstance(); this._instance.octaves = value; }
    static get amplitude() { this.ensureInstance(); return this._instance.amplitude; }
    static set amplitude(value) { this.ensureInstance(); this._instance.amplitude = value; }
    static get frequency() { this.ensureInstance(); return this._instance.frequency; }
    static set frequency(value) { this.ensureInstance(); this._instance.frequency = value; }
    static get lacunarity() { this.ensureInstance(); return this._instance.lacunarity; }
    static set lacunarity(value) { this.ensureInstance(); this._instance.lacunarity = value; }
    static get gain() { this.ensureInstance(); return this._instance.gain; }
    static set gain(value) { this.ensureInstance(); this._instance.gain = value; }

    static init(
        octaves: number = 4,
        amplitude: number = 1,
        frequency: number = 1,
        lacunarity: number = 2,
        gain: number = 0.5) {
        this._instance = new Perlin(octaves, amplitude, frequency, lacunarity, gain);
    }

    static getValue(x: number, scale?: number) {
        this.ensureInstance();
        return this._instance.getValue(x, scale);
    }

    static fractal(
        x: number,
        scale?: number,
        octaves?: number,
        amplitude?: number,
        frequency?: number,
        lacunarity?: number,
        gain?: number) {

        this.ensureInstance();
        return this._instance.fractal(x, scale, octaves, amplitude, frequency, lacunarity, gain);
    }

    protected static ensureInstance() {
        if (this._instance) return;

        this.init();
    }

    private grad1d(hash: number, x: number) { return (hash & 1) === 0 ? -x : x; }

    private grad2d(hash: number, x: number, y: number) {
        const v = (hash & 1) === 0 ? x : y;
        return (hash & 2) === 0 ? -v : v;
    }

    // http://riven8192.blogspot.com/2010/08/calculate-perlinnoise-twice-as-fast.html
    private grad3d(hash: number, x: number, y: number, z: number) {
        // Convert lo 4 bits of hash code into 12 gradient directions.
        switch (hash & 0xF) {
            case 0x0: return x + y;
            case 0x1: return -x + y;
            case 0x2: return x - y;
            case 0x3: return -x - y;
            case 0x4: return x + z;
            case 0x5: return -x + z;
            case 0x6: return x - z;
            case 0x7: return -x - z;
            case 0x8: return y + z;
            case 0x9: return -y + z;
            case 0xA: return y - z;
            case 0xB: return -y - z;
            case 0xC: return y + x;
            case 0xD: return -y + z;
            case 0xE: return y - x;
            case 0xF: return -y - z;
            default: return 0; // never happens
        }
    }
}

Noise.initialize(new Perlin());
