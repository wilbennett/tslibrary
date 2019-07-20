import { Palette, PaletteBuilder } from '..';
import { CanvasColor, Color, ColorUtils, WebColors } from '../..';
import { Ease } from '../../../easing';

function formatStops(stops: number[]) {
    return stops.map(s => s.toFixed(2));
}

describe("Should create palettes", () => {
    const paletteLength = 10;
    const refCanvasColors: CanvasColor[] = [WebColors.red, "white", WebColors.green, "blue"];
    const refColors = ColorUtils.toColorArray(...refCanvasColors);
    const stops: number[] = [];
    Palette.calcColorStops(refCanvasColors.length, stops);
    let colors: Color[] = [];

    function validate(paletteOrColors: Palette | Color[]): void {
        if (paletteOrColors instanceof Palette) {
            expect(paletteOrColors.colors).toEqual(colors);
            expect(formatStops(paletteOrColors.colorStops)).toEqual(formatStops(stops));
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
        expect(stops).toMatchSnapshot();

        let palette = new Palette(paletteLength, stops, ...refCanvasColors);
        expect(palette.colors).toMatchSnapshot();
        expect(palette.colorStops).toEqual(stops);

        colors = palette.colors;

        expect(() => validate(new Palette(paletteLength, Ease.linear, stops, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette(paletteLength, Ease.linear, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette(paletteLength, ...refCanvasColors))).not.toThrow();

        expect(() => validate(Palette.build(refCanvasColors).count(paletteLength).ease(Ease.linear).palette)).not.toThrow();
        expect(() => validate(Palette.build(refCanvasColors).count(paletteLength).stops(stops).palette)).not.toThrow();
        expect(() => validate(Palette.build(...refCanvasColors).count(paletteLength).ease(Ease.linear).palette)).not.toThrow();
        expect(() => validate(Palette.build(...refCanvasColors).count(paletteLength).stops(...stops).palette)).not.toThrow();

        expect(() => validate(new Palette("", paletteLength, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("invalid", paletteLength, ...refCanvasColors))).not.toThrow();

        expect(() => validate(Palette.getColors(paletteLength, refColors, stops, "rgb"))).not.toThrow();

        expect(() => validate(Palette.build(refCanvasColors).count(paletteLength).colors)).not.toThrow();

        palette = new Palette("lrgb", paletteLength, stops, ...refCanvasColors);
        expect(palette.colors).toMatchSnapshot();
        expect(palette.colorStops).toEqual(stops);

        colors = palette.colors;

        expect(() => validate(new Palette("lrgb", paletteLength, Ease.linear, stops, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("lrgb", paletteLength, Ease.linear, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("lrgb", paletteLength, ...refCanvasColors))).not.toThrow();

        expect(() => validate(Palette.build(refCanvasColors).count(paletteLength).tween("lrgb").colors)).not.toThrow();

        expect(() => validate(Palette.getColors(paletteLength, refColors, stops, "lrgb"))).not.toThrow();

        palette = new Palette("hsl", paletteLength, stops, ...refCanvasColors);
        expect(palette.colors).toMatchSnapshot();
        expect(palette.colorStops).toEqual(stops);

        colors = palette.colors;

        expect(() => validate(new Palette("hsl", paletteLength, Ease.linear, stops, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("hsl", paletteLength, Ease.linear, ...refCanvasColors))).not.toThrow();
        expect(() => validate(new Palette("hsl", paletteLength, ...refCanvasColors))).not.toThrow();

        expect(() => validate(new PaletteBuilder(...refCanvasColors).count(paletteLength).tween("hsl").colors)).not.toThrow();

        expect(() => validate(Palette.getColors(paletteLength, refColors, stops, "hsl"))).not.toThrow();
    });
});
