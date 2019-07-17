import { Palette } from '..';
import { CanvasColor, Color, ColorUtils, WebColors } from '../..';
import { Ease } from '../../../easing';

describe.only("Should create palettes", () => {
    const paletteLength = 10;
    const refCanvasColors: CanvasColor[] = [WebColors.red, WebColors.green, "blue"];
    const refColors = ColorUtils.toColorArray(...refCanvasColors);
    const stops = [0, 0.5, 1];
    let colors: Color[] = [];

    function validate(paletteOrColors: Palette | Color[]): void {
        if (paletteOrColors instanceof Palette) {
            expect(paletteOrColors.colors).toEqual(colors);
            expect(paletteOrColors.colorStops).toEqual(stops);
        } else {
            expect(paletteOrColors).toEqual(colors);
        }
    }

    it("Should error with invalid parameters", () => {
        const stops1 = stops.slice(0, 0);
        const refCanvasColors1 = refCanvasColors.slice(0, 0);
        const refColors1 = refColors.slice(0, 0);

        expect(() => new Palette(2, stops1, ...refCanvasColors)).toThrow();
        expect(() => new Palette(2, Ease.linear, stops1, ...refCanvasColors)).toThrow();
        expect(() => new Palette(2, Ease.linear, ...refCanvasColors1)).toThrow();
        expect(() => new Palette(1, ...refCanvasColors)).toThrow();

        expect(() => new Palette("hsl", 2, stops1, ...refCanvasColors)).toThrow();
        expect(() => new Palette("hsl", 2, Ease.linear, stops1, ...refCanvasColors)).toThrow();
        expect(() => new Palette("hsl", 2, Ease.linear, ...refCanvasColors1)).toThrow();
        expect(() => new Palette("hsl", 1, ...refCanvasColors)).toThrow();

        expect(() => Palette.getColors(1, refColors, stops1, "rgb", Ease.linear, colors)).toThrow();
        expect(() => Palette.getColors(2, refColors, stops1, "rgb", Ease.linear, colors)).toThrow();
        expect(() => Palette.getColors(2, refColors1, stops, "rgb", Ease.linear, colors)).toThrow();
    });

    it("Should allow creating Palette instance", () => {
        let palette = new Palette(paletteLength, stops, ...refCanvasColors);
        expect(palette.colors).toMatchSnapshot();
        expect(palette.colorStops).toEqual(stops);

        colors = palette.colors;

        expect(() => validate(new Palette(paletteLength, Ease.linear, stops, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette(paletteLength, Ease.linear, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette(paletteLength, ...refCanvasColors))).not.toThrow();

        expect(() => validate(new Palette("", paletteLength, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("invalid", paletteLength, ...refCanvasColors))).not.toThrow();

        expect(() => validate(Palette.getColors(paletteLength, refColors, stops, "rgb"))).not.toThrow();

        palette = new Palette("lrgb", paletteLength, stops, ...refCanvasColors);
        expect(palette.colors).toMatchSnapshot();
        expect(palette.colorStops).toEqual(stops);

        colors = palette.colors;

        expect(() => validate(new Palette("lrgb", paletteLength, Ease.linear, stops, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("lrgb", paletteLength, Ease.linear, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("lrgb", paletteLength, ...refCanvasColors))).not.toThrow();

        expect(() => validate(Palette.getColors(paletteLength, refColors, stops, "lrgb"))).not.toThrow();

        palette = new Palette("hsl", paletteLength, stops, ...refCanvasColors);
        expect(palette.colors).toMatchSnapshot();
        expect(palette.colorStops).toEqual(stops);

        colors = palette.colors;

        expect(() => validate(new Palette("hsl", paletteLength, Ease.linear, stops, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("hsl", paletteLength, Ease.linear, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("hsl", paletteLength, ...refCanvasColors))).not.toThrow();

        expect(() => validate(Palette.getColors(paletteLength, refColors, stops, "hsl"))).not.toThrow();
    });
});
