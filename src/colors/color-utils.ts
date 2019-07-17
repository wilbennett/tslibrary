import { CanvasColor, Color, SColor } from '.';

export class ColorUtils {
    static toColorArray(colors: CanvasColor[]): Color[];
    static toColorArray(...colors: CanvasColor[]): Color[];
    static toColorArray(param1: any): Color[] {
        let colors = <CanvasColor[]>(Array.isArray(param1) ? param1 : Array.from(arguments));

        return colors.map(c => c instanceof Color ? c : new SColor(c));
    }
}
