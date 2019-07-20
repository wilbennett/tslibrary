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
}

Noise.initialize(new Perlin());
