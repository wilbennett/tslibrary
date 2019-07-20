import { CanvasColor, Color, ColorUtils } from '..';
import { isNumberArray, NumberArray } from '../../core';
import { Ease, EaseFunction } from '../../easing';
import { ColorTweeners, RgbTweener, TweenerKey } from '../tweeners';

export class Palette {
    constructor(length: number, colorStops: NumberArray, ...colors: CanvasColor[]);
    constructor(length: number, ease: EaseFunction, colorStops: NumberArray, ...colors: CanvasColor[]);
    constructor(length: number, ease: EaseFunction, ...colors: CanvasColor[]);
    constructor(length: number, ...colors: CanvasColor[]);
    constructor(tween: TweenerKey, length: number, colorStops: NumberArray, ...colors: CanvasColor[]);
    constructor(tween: TweenerKey, length: number, ease: EaseFunction, colorStops: NumberArray, ...colors: CanvasColor[]);
    constructor(tween: TweenerKey, length: number, ease: EaseFunction, ...colors: CanvasColor[]);
    constructor(tween: TweenerKey, length: number, ...colors: CanvasColor[]);
    // @ts-ignore - unused param.
    constructor(param1: number | TweenerKey, ...param2: (number | CanvasColor | NumberArray | EaseFunction)[]) {
        // @ts-ignore - arguments length.
        [this._colors, this._colorStops] = Palette.generateColors(...arguments);
    }

    private _colors: Color[];
    get colors() { return this._colors; }
    private _colorStops: number[];
    get colorStops() { return this._colorStops; }

    static generateColors(length: number, colorStops: NumberArray, ...colors: CanvasColor[]): [Color[], NumberArray];
    static generateColors(length: number, ease: EaseFunction, colorStops: NumberArray, ...colors: CanvasColor[]): [Color[], NumberArray];
    static generateColors(length: number, ease: EaseFunction, ...colors: CanvasColor[]): [Color[], NumberArray];
    static generateColors(length: number, ...colors: CanvasColor[]): [Color[], NumberArray];
    static generateColors(tween: TweenerKey, length: number, colorStops: NumberArray, ...colors: CanvasColor[]): [Color[], NumberArray];
    static generateColors(tween: TweenerKey, length: number, ease: EaseFunction, colorStops: NumberArray, ...colors: CanvasColor[]): [Color[], NumberArray];
    static generateColors(tween: TweenerKey, length: number, ease: EaseFunction, ...colors: CanvasColor[]): [Color[], NumberArray];
    static generateColors(tween: TweenerKey, length: number, ...colors: CanvasColor[]): [Color[], NumberArray];
    static generateColors(param1: number | TweenerKey, ...param2: (number | CanvasColor | NumberArray | EaseFunction)[]): [Color[], NumberArray] {
        let colorStops: NumberArray;
        let refColors: Color[];
        let ease = Ease.linear;
        let length: number;
        let tween: TweenerKey;

        if (typeof param1 === "number") {
            length = param1;
            tween = "rgb";
        } else {
            tween = param1;
            length = +param2.shift()!;
        }

        if (isNumberArray(param2[0])) {
            colorStops = <number[]>param2.shift();
            const colors = <CanvasColor[]>param2;
            refColors = ColorUtils.toColorArray(...colors);
        } else if (typeof param2[0] === "function" && isNumberArray(param2[1])) {
            ease = <EaseFunction>param2.shift();
            colorStops = <number[]>param2.shift();
            const colors = <CanvasColor[]>param2;
            refColors = ColorUtils.toColorArray(...colors);
        } else if (typeof param2[0] === "function") {
            ease = <EaseFunction>param2.shift();
            const colors = <CanvasColor[]>param2;
            refColors = ColorUtils.toColorArray(...colors);
            colorStops = this.calcColorStops(refColors.length);
        } else {
            const colors = <CanvasColor[]>param2;
            refColors = ColorUtils.toColorArray(...colors);
            colorStops = this.calcColorStops(refColors.length);
        }

        const colors = this.getColors(length, refColors, colorStops, tween, ease);
        return [colors, colorStops];
    }

    static calcColorStops(count: number, result?: NumberArray) {
        count = Math.max(count, 2);
        const countMinus1 = count - 1;
        result = result || new Array<number>(count);

        for (let i = 0; i < count; i++) {
            result[i] = i / countMinus1;
        }

        return result;
    }

    static getColorStopIndex(t: number, colorStops: NumberArray, length: number = Infinity) {
        length = Math.min(length, colorStops.length);

        for (let i = 1; i < length; i++) {
            if (colorStops[i] > t) return i - 1;
        }

        return length - 2;
    }

    static getColors(count: number, colors: Color[], colorStops: NumberArray, tween?: TweenerKey, ease?: EaseFunction, result?: Color[]): Color[] {
        if (count < 2) throw new Error("count must be at least 2.");
        if (colors.length < 2) throw new Error("Must have at least 2 colors.");
        if (colorStops.length < 2) throw new Error("Must have at least 2 color stops.");

        tween = tween || "rgb";
        ease = ease || Ease.linear;
        const countMinus1 = count - 1;
        const stopsLength = Math.min(colorStops.length, colors.length);
        result = result || new Array<Color>(length);
        const tweener = ColorTweeners.get(tween) || new RgbTweener();

        for (let i = 0; i < count; i++) {
            const colorStopT = ease(i / countMinus1);
            let index = this.getColorStopIndex(colorStopT, colorStops, stopsLength);
            const stopStart = colorStops[index];
            const stopEnd = colorStops[index + 1];

            let t = (colorStopT - stopStart) / (stopEnd - stopStart);
            result[i] = tweener.tween(colors[index], colors[index + 1], t);
        }

        return result;
    }
}
