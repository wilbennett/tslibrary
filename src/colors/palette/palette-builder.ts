import { CanvasColor, Color, ColorUtils } from '..';
import { isNumberArray, NumberArray } from '../../core';
import { Ease, EaseFunction } from '../../easing';
import { TweenerKey } from '../tweeners';
import { Palette } from './palette';

export class PaletteBuilder {
    private _length: number;
    private _stopColors: Color[];
    private _colorStops: NumberArray;
    private _tween: TweenerKey = "rgb";
    private _ease: EaseFunction = Ease.linear;

    constructor(colors: CanvasColor[]);
    constructor(...colors: CanvasColor[]);
    constructor(colors: any) {
        if (!Array.isArray(colors)) {
            colors = <CanvasColor[]>Array.from(arguments);
        }

        this._stopColors = ColorUtils.toColorArray(colors);
        this._length = this._stopColors.length;
        this._colorStops = Palette.calcColorStops(this._length);
    }

    get palette() {
        return new Palette(
            this._tween,
            this._length,
            this._ease,
            this._colorStops,
            ...this._stopColors);
    }

    get colors() {
        const [colors] = Palette.generateColors(
            this._tween,
            this._length,
            this._ease,
            this._colorStops,
            ...this._stopColors);

        return colors;
    }

    count(value: number) {
        this._length = value;
        return this;
    }

    tween(value: TweenerKey) {
        this._tween = value;
        return this;
    }

    ease(value: EaseFunction) {
        this._ease = value;
        return this;
    }

    stops(value: NumberArray): this;
    stops(...value: number[]): this;
    stops(value: any): this {
        value = <NumberArray>(isNumberArray(value) ? value : Array.from(arguments));
        this._colorStops = value;
        return this;
    }
}

function build(colors: CanvasColor[]): PaletteBuilder;
function build(...colors: CanvasColor[]): PaletteBuilder;
function build(colors: any): PaletteBuilder {
    if (!Array.isArray(colors)) {
        colors = <CanvasColor[]>Array.from(arguments);
    }

    return new PaletteBuilder(colors);
}

declare module "./palette" {
    namespace Palette {
        export function build(colors: CanvasColor[]): PaletteBuilder;
        export function build(...colors: CanvasColor[]): PaletteBuilder;
    }
}

Palette.build = build;
