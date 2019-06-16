import { ColorConverter } from '.';
import { Color, ColorData, ColorFormat } from '..';
import { MathEx } from '../../core';

const ONE_255TH = Color.ONE_255TH;
const ONE_360TH = 1 / 360;
const ONE_SIXTH = 1 / 6;
const ONE_THIRD = 1 / 3;
const TWO_THIRDS = 2 / 3;

export class HslConverter extends ColorConverter {
  protected static readonly _buffer: number[] = [0, 0, 0, 0];

  get formats(): ColorFormat[] {
    return [
      "hsl", "hsla", "hslpct", "hslapct",
      "hsldeg", "hsladeg", "hsldegpct", "hsladegpct",
      "hslrad", "hslarad", "hslradpct", "hslaradpct",
      "hslturn", "hslaturn", "hslturnpct", "hslaturnpct",
    ];
  }

  get isHsl() { return true; }

  getAlpha(currentValue: number) {
    return Color.decodeHsl(currentValue, HslConverter._buffer)[3];
  }

  setAlpha(value: number, currentValue: number) {
    const [h, s, l] = Color.decodeHsl(currentValue, HslConverter._buffer);
    return Color.encodeHsl(h, s, l, value);
  }

  getAlphaPercent(currentValue: number) {
    return Color.decodeHsl(currentValue, HslConverter._buffer, 0, "hslapct")[3];
  }

  setAlphaPercent(value: number, currentValue: number) {
    const [h, s, l] = Color.decodeHsl(currentValue, HslConverter._buffer);
    return Color.encodeHsl(h, s, l, MathEx.clamp(value, 0, 100) * 0.01);
  }

  get(channel: number | string, currentValue: number, format?: ColorFormat) {
    const values = Color.decodeHsl(currentValue, HslConverter._buffer, 0, format);

    switch (channel) {
      case 0:
      case "h":
      case "hue":
        return values[0];

      case 1:
      case "s":
      case "sat":
      case "saturation":
        return values[1];

      case 2:
      case "l":
      case "light":
      case "lightness":
        return values[2];

      case 3:
      case "a":
      case "alpha":
      default:
        return values[3];
    }
  }

  set(channel: number | string, newValue: number, currentValue: number, format?: ColorFormat) {
    const values = Color.decodeHsl(currentValue, HslConverter._buffer, 0, format);

    switch (channel) {
      case 0:
      case "h":
      case "hue":
        return Color.encodeHsl(newValue, values[1], values[2], values[3], format);

      case 1:
      case "s":
      case "sat":
      case "saturation":
        return Color.encodeHsl(values[0], newValue, values[2], values[3], format);

      case 2:
      case "l":
      case "light":
      case "lightness":
        return Color.encodeHsl(values[0], values[1], newValue, values[3], format);

      case 3:
      case "a":
      case "alpha":
      default:
        return Color.encodeRgb(values[0], values[1], values[3], newValue, format);
    }
  }

  encode(values: ColorData, startIndex?: number, format?: ColorFormat) {
    startIndex = startIndex || 0;
    const h = values[startIndex++];
    const s = values[startIndex++];
    const l = values[startIndex++];
    const a = values[startIndex];
    return Color.encodeHsl(h, s, l, a, format);
  }

  decode(value: number, result: ColorData, startIndex?: number, format?: ColorFormat) {
    return Color.decodeHsl(value, result, startIndex, format);
  }

  fromRgb(rgb: number): number;
  fromRgb(r: number, g: number, b: number, a: number): number;
  fromRgb(param1: number, g?: number, b?: number, a?: number): number {
    if (arguments.length === 1)
      [param1, g, b, a] = Color.decodeRgb(param1, HslConverter._buffer);

    return this.rgbToHsl(param1, g!, b!, a!);
  }

  toRgb(value: number): number;
  toRgb(value: number, result: ColorData, startIndex?: number, format?: ColorFormat): ColorData;
  toRgb(value: number, result?: ColorData, startIndex?: number, format?: ColorFormat): number | ColorData {
    const [h, s, l, a] = Color.decodeHsl(value, HslConverter._buffer);
    const rgbValue = this.hslToRgb(h, s, l, a);
    return result ? Color.decodeRgb(rgbValue, result, startIndex, format) : rgbValue;
  }

  parse(text: string) {
    if (!/^\s*hsla?/i.test(text)) return undefined;

    let m = text.match(/^\s*\w+\(([\d.e+-]+)(deg|rad|turn|)\s*,\s*([\d.e+-]+)%\s*,\s*([\d.e+-]+)%(?:\s*,\s*(?:([\d.e+-]+)%|([\d.e+-]+)))?\s*\)$/);

    if (!m)
      m = text.match(/^\s*\w+\(([\d.e+-]+)(deg|rad|turn|)\s+([\d.e+-]+)%\s*([\d.e+-/]+)%(?:\s*\/\s*(?:([\d.e+-]+)%|([\d.e+-]+)))?\s*\)$/);

    if (!m) return undefined;

    let a = 1;
    let h = 0;
    let s = 0;
    let l = 0;

    if (m[2] === "" || m[2] === "deg") {
      h = MathEx.toInt(m[1]);
    } else if (m[2] === "rad") {
      h = MathEx.toDegrees(MathEx.wrapRadians(MathEx.toFloat(m[1])));
    } else if (m[2] === "turn") {
      h = Math.round(MathEx.toFloat(m[1]) * 360);
    }

    s = MathEx.toInt(m[3]);
    l = MathEx.toInt(m[4]);

    if (m[5] !== undefined) { // With %. e.g. 50%
      a = MathEx.toFloat(m[5]) * 0.01;
    } else if (m[6] !== undefined) {
      a = MathEx.toFloat(m[6]);
    }

    return Color.encodeHsl(h, s, l, a);
  }

  toString(value: number, format?: ColorFormat, precision?: number) {
    format = format || "hsl";
    let fmt = format.startsWith("hsla") ? "hsla" : "hsl";
    const aPrec = ColorConverter.A_PRECISION;

    if (fmt === "hsl")
      format = <ColorFormat>("hsla" + format.substr(3));

    const [h, s, l, a] = Color.decodeHsl(value, HslConverter._buffer, 0, format);
    let unit = format.includes("rad") ? "rad" : format.includes("turn") ? "turn" : format.includes("deg") ? "deg" : "";
    let aStr = format.endsWith("pct") ? `${a}%` : `${a.toPrecision(aPrec)}`;
    let maxA = format.endsWith("pct") ? 100 : 1;

    let hStr = unit === "rad" ? `${h.toFixed(precision === undefined ? 5 : precision)}`
      : unit === "turn" ? `${h.toPrecision(2)}`
        : `${h}`;

    switch (fmt) {
      case "hsla":
        return `hsla(${hStr}${unit}, ${s}%, ${l}%, ${aStr})`;

      case "hsl":
      default:
        return a === maxA ? `hsl(${hStr}${unit}, ${s}%, ${l}%)` : `hsl(${hStr}${unit}, ${s}%, ${l}%, ${aStr})`;
    }
  }

  protected hslToRgb(h: number, s: number, l: number, a: number) {
    let r: number;
    let g: number;
    let b: number;

    if (s == 0) {
      r = g = b = Math.round(l * 0.01 * 255);
      return Color.encodeRgb(r, g, b, a);
    }

    h *= ONE_360TH;
    s *= 0.01;
    l *= 0.01;

    const q = l < 0.5
      ? l * (1 + s)
      : l + s - l * s;

    const p = 2 * l - q;

    r = this.hueToRgb(p, q, h + ONE_THIRD);
    g = this.hueToRgb(p, q, h);
    b = this.hueToRgb(p, q, h - ONE_THIRD);
    return Color.encodeRgb(r, g, b, a);
  }

  protected rgbToHsl(r: number, g: number, b: number, a: number) {
    r *= ONE_255TH;
    g *= ONE_255TH;
    b *= ONE_255TH;

    const min: number = Math.min(r, g, b);
    const max: number = Math.max(r, g, b);

    let h: number = 0;
    let s: number = 0;
    let l: number = (max + min) * 0.5;

    if (min !== max) {
      const chroma = max - min;
      s = chroma / (1 - Math.abs(2 * l - 1))

      h = r === max ? (g - b) / chroma
        : g === max ? (b - r) / chroma + 2
          : (r - g) / chroma + 4;
    }

    return Color.encodeHsl(Math.round(h * 60), Math.round(s * 100), Math.round(l * 100), a);
  }

  protected hueToRgb(p: number, q: number, hue: number) {
    if (hue < 0) hue += 1;
    if (hue > 1) hue -= 1;
    if (hue < ONE_SIXTH) return Math.round((p + (q - p) * 6 * hue) * 255);
    if (hue < 0.5) return Math.round(q * 255);
    if (hue < TWO_THIRDS) return Math.round((p + (q - p) * (TWO_THIRDS - hue) * 6) * 255);
    return Math.round(p * 255);
  }
}

Color.addConverter(new HslConverter());
