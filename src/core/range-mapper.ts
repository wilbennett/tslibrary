import { MathEx } from '.';

export class RangeMapper {
    private _slope!: number;
    private _intercept!: number;
    private _dirty: boolean;

    constructor(
        private _min: number,
        private _max: number,
        private _newMin: number,
        private _newMax: number) {
        this._dirty = true;
    }
    get min() { return this._min; }
    set min(value) {
        this._min = value;
        this._dirty = true;
    }

    get max() { return this._max; }
    set max(value) {
        this._max = value;
        this._dirty = true;
    }

    get newMin() { return this._newMin; }
    set newMin(value) {
        this._newMin = value;
        this._dirty = true;
    }

    get newMax() { return this._newMax; }
    set newMax(value) {
        this._newMax = value;
        this._dirty = true;
    }

    convert(value: number) {
        if (this._dirty)
            this.calcSlopeIntercept();

        return value * this._slope + this._intercept;
    }

    convertClamp(value: number) { return MathEx.clamp(this.convert(value), this._newMin, this._newMax); }
    convertAsInt(value: number) { return Math.round(this.convert(value)); }

    convertAsIntClamp(value: number) {
        return MathEx.clamp(Math.round(this.convert(value)), this._newMin, this._newMax);
    }

    reverse(value: number) {
        if (this._dirty)
            this.calcSlopeIntercept();

        return this._slope !== 0 ? (value - this._intercept) / this._slope : this.min;
    }

    reverseClamp(value: number) { return MathEx.clamp(this.reverse(value), this._min, this._max); }
    reverseAsInt(value: number) { return Math.round(this.reverse(value)); }

    reverseAsIntClamp(value: number) {
        return MathEx.clamp(Math.round(this.reverse(value)), this._min, this._max);
    }

    private calcSlopeIntercept() {
        this._dirty = false;
        let run = this.max - this.min;

        if (run === 0) {
            this._slope = 0;
            this._intercept = this.newMin;
            return;
        }

        this._slope = (this.newMax - this.newMin) / run;
        this._intercept = this.newMax - (this._slope * this.max);
    }
}
