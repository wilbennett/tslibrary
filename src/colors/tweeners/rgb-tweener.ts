import { ColorTweener, ColorTweeners } from '.';
import { Color, SColor } from '..';
import { MathEx } from '../../core';

const { lerp } = MathEx;

export class RgbTweener extends ColorTweener {
    tween(start: Color, end: Color, t: number): Color {
        const red = lerp(start.get(0, "rgb"), end.get(0, "rgb"), t) & 255;
        const green = lerp(start.get(1, "rgb"), end.get(1, "rgb"), t) & 255;
        const blue = lerp(start.get(2, "rgb"), end.get(2, "rgb"), t) & 255;
        const alpha = lerp(start.get(3, "rgb"), end.get(3, "rgb"), t) & 255;

        return new SColor(red, green, blue, alpha);
    }
}

ColorTweeners.add("rgb", new RgbTweener());
