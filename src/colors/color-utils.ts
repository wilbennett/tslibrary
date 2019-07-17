import { Color, SColor } from '.';

export class ColorUtils {
    static toColorArray(...colors: (string | Color)[]): Color[] {
        return colors.map(c => c instanceof Color ? c : new SColor(c));
    }
}
