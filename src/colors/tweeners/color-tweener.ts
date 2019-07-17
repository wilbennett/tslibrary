import { Color } from '..';

export abstract class ColorTweener {
    abstract tween(start: Color, end: Color, t: number): Color;
}
