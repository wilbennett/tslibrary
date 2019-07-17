import { ColorTweener, ColorTweeners } from '.';
import { Color, SColor } from '..';

export class LogRgbTweener extends ColorTweener {
    tween(start: Color, end: Color, t: number): Color {
        const red1 = start.get(0, "rgb");
        const green1 = start.get(1, "rgb");
        const blue1 = start.get(2, "rgb");
        const alpha1 = start.get(3, "rgb");
        const red2 = end.get(0, "rgb");
        const green2 = end.get(1, "rgb");
        const blue2 = end.get(2, "rgb");
        const alpha2 = end.get(3, "rgb");
        const t2 = 1 - t;

        const red = Math.sqrt(red1 * red1 * t2 + red2 * red2 * t) & 255;
        const green = Math.sqrt(green1 * green1 * t2 + green2 * green2 * t) & 255;
        const blue = Math.sqrt(blue1 * blue1 * t2 + blue2 * blue2 * t) & 255;
        const alpha = Math.sqrt(alpha1 * alpha1 * t2 + alpha2 * alpha2 * t) & 255;

        return new SColor(red, green, blue, alpha);
    }
}

ColorTweeners.add("lrgb", new LogRgbTweener());
