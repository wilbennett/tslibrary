import { ColorTweener, ColorTweeners } from '.';
import { Color, SColor } from '..';
import { MathEx } from '../../core';

const { lerp } = MathEx;

export class HslTweener extends ColorTweener {
    tween(start: Color, end: Color, t: number): Color {
        const hue = Math.round(lerp(start.get(0, "hsl"), end.get(0, "hsl"), t));
        const sat = Math.round(lerp(start.get(1, "hsl"), end.get(1, "hsl"), t));
        const light = Math.round(lerp(start.get(2, "hsl"), end.get(2, "hsl"), t));
        const alpha = Math.round(lerp(start.get(3, "hsl"), end.get(3, "hsl"), t));

        return new SColor("hsl", hue, sat, light, alpha);
    }
}

ColorTweeners.add("hsl", new HslTweener());
