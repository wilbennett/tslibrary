const TWO_POW31 = Math.pow(2, 31);
const TWO_POW31_MINUS1 = TWO_POW31 - 1;
const TWO_POW31_MINUS2 = TWO_POW31 - 2;
const TWO_POW31_MINUS2_INV = 1 / TWO_POW31_MINUS2;

// https://gist.github.com/blixt/f17b47c62508be59987b
// http://www.firstpr.com.au/dsp/rand31/
export class Random {
    constructor(seed?: number) {
        this.randomize(seed);
    }

    private _seed: number = 0;
    get seed() { return this._seed; }
    set seed(value) {
        this._seed = value % TWO_POW31_MINUS1;

        if (this._seed <= 0)
            this._seed += TWO_POW31_MINUS2;

        this.nextInt(); // Skip first. First float values are usually low.
    }

    randomize(seed?: number) {
        this.seed = seed !== undefined ? seed : Math.round(Math.random() * TWO_POW31) + 1;
    }

    // [1, 2^31 - 2]
    nextInt() { return this._seed = this._seed * 16807 % TWO_POW31_MINUS1; }
    // [0, 1)
    next() { return (this.nextInt() - 1) * TWO_POW31_MINUS2_INV; }
}
