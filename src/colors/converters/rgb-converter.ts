import { ColorConverter, HexConverter } from '.';
import { Color, ColorFormat } from '..';
import { MathEx } from '../../core';

export class RgbConverter extends HexConverter {
  get formats(): ColorFormat[] {
    return ["rgb", "rgba", "rgba255", "rgbpct", "rgbapct", "rgbfrac", "rgbafrac"];
  }

  parse(text: string) {
    if (!/^\s*rgba?/i.test(text)) return undefined;

    return this.parseRgbValue(text) || this.parseRgbPercent(text);
  }

  toString(value: number, format?: ColorFormat, precision?: number) {
    const prec = precision || 0;
    const aPrec = ColorConverter.A_PRECISION;
    let r: number;
    let g: number;
    let b: number;
    let a: number;

    switch (format || "rgb") {
      case "rgba":
      case "rgba255":
        [r, g, b, a] = Color.decodeRgb(value, HexConverter._buffer);
        return `rgba(${r}, ${g}, ${b}, ${a.toPrecision(aPrec)})`;

      case "rgbapct":
        [r, g, b, a] = Color.decodeRgb(value, HexConverter._buffer, 0, "rgbapct");
        return `rgba(${(r).toFixed(prec)}%, ${(g).toFixed(prec)}%, ${(b).toFixed(prec)}%, ${a}%)`;

      case "rgbpct":
        [r, g, b, a] = Color.decodeRgb(value, HexConverter._buffer, 0, "rgbapct");

        return a === 100
          ? `rgb(${(r).toFixed(prec)}%, ${(g).toFixed(prec)}%, ${(b).toFixed(prec)}%)`
          : `rgb(${(r).toFixed(prec)}%, ${(g).toFixed(prec)}%, ${(b).toFixed(prec)}%, ${a}%)`;

      case "rgb":
      default:
        [r, g, b, a] = Color.decodeRgb(value, HexConverter._buffer);
        return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgb(${r}, ${g}, ${b}, ${a.toPrecision(aPrec)})`;
    }
  }

  protected parseRgbValue(value: string) {
    let m = value.match(/^\s*(\w+)\(([^,%]+)\s*,\s*([^,%]+)\s*,\s*([^,%]+)(?:,(?:\s*([^,%]+)%|([^,%]+)))?\s*\)$/);

    if (!m)
      m = value.match(/^\s*(\w+)\(([^ %]+)\s+([^ %]+)\s+([^ %/]+)(?:\s*\/\s*(?:([^ %]+)%|([^ %]+)))?\s*\)$/);

    if (!m) return undefined;

    let a = 1;
    const r = MathEx.toInt(m[2]);
    const g = MathEx.toInt(m[3]);
    const b = MathEx.toInt(m[4]);

    if (m[5] !== undefined) { // With %. e.g. 50%
      a = MathEx.toFloat(m[5]) * 0.01;
    } else if (m[6] !== undefined) {
      a = MathEx.toFloat(m[6]);
    }

    return Color.encodeRgb(r, g, b, a);
  }

  protected parseRgbPercent(value: string) {
    let m = value.match(/^\s*(\w+)\(([^,%]+)%\s*,\s*([^,%]+)%\s*,\s*([^,%]+)%(?:\s*,\s*(?:([^,%]+)%|([^,%]+)))?\s*\)$/);

    if (!m)
      m = value.match(/^\s*(\w+)\(([^ %]+)%\s+([^ %]+)%\s+([^ %/]+)%(?:\s*\/\s*(?:([^ %]+)%|([^ %]+)))?\s*\)$/);

    if (!m) return undefined;

    let a = 100;
    const r = MathEx.toInt(m[2]);
    const g = MathEx.toInt(m[3]);
    const b = MathEx.toInt(m[4]);

    if (m[5] !== undefined) { // With %. e.g. 50%
      a = MathEx.toFloat(m[5]);
    } else if (m[6] !== undefined) {
      a = MathEx.toFloat(m[6]) * 100;
    }

    return Color.encodeRgb(r, g, b, a, "rgbapct");
  }
}

Color.addConverter(new RgbConverter());
