import { ColorConverter } from '.';
import { Color, ColorData, ColorFormat } from '..';
import { MathEx } from '../../core';

export class HexConverter extends ColorConverter {
  protected static readonly _buffer: number[] = [0, 0, 0, 0];

  get formats(): ColorFormat[] { return ["hex", "hexa", "hexa255", "hexfrac", "hexafrac"]; }
  get isRgb() { return true; }

  getAlpha(currentValue: number) {
    return Color.decodeRgb(currentValue, HexConverter._buffer)[3];
  }

  setAlpha(value: number, currentValue: number) {
    const [r, g, b] = Color.decodeRgb(currentValue, HexConverter._buffer);
    return Color.encodeRgb(r, g, b, value);
  }

  getAlphaPercent(currentValue: number) {
    return Color.decodeRgb(currentValue, HexConverter._buffer, 0, "rgbpct")[3];
  }

  setAlphaPercent(value: number, currentValue: number) {
    const [r, g, b] = Color.decodeRgb(currentValue, HexConverter._buffer);
    return Color.encodeRgb(r, g, b, MathEx.clamp(value, 0, 100) * 0.01);
  }

  get(channel: number | string, currentValue: number, format?: ColorFormat) {
    const values = Color.decodeRgb(currentValue, HexConverter._buffer, 0, format);

    switch (channel) {
      case 0:
      case "r":
      case "red":
        return values[0];

      case 1:
      case "g":
      case "green":
        return values[1];

      case 2:
      case "b":
      case "blue":
        return values[2];

      case 3:
      case "a":
      case "alpha":
      default:
        return values[3];
    }
  }

  set(channel: number | string, newValue: number, currentValue: number, format?: ColorFormat) {
    const values = Color.decodeRgb(currentValue, HexConverter._buffer, 0, format);

    switch (channel) {
      case 0:
      case "r":
      case "red":
        return Color.encodeRgb(newValue, values[1], values[2], values[3], format);

      case 1:
      case "g":
      case "green":
        return Color.encodeRgb(values[0], newValue, values[2], values[3], format);

      case 2:
      case "b":
      case "blue":
        return Color.encodeRgb(values[0], values[1], newValue, values[3], format);

      case 3:
      case "a":
      case "alpha":
      default:
        return Color.encodeRgb(values[0], values[1], values[3], newValue, format);
    }
  }

  encode(values: ColorData, startIndex?: number, format?: ColorFormat) {
    startIndex = startIndex || 0;
    const r = values[startIndex++];
    const g = values[startIndex++];
    const b = values[startIndex++];
    const a = values[startIndex];
    return Color.encodeRgb(r, g, b, a, format);
  }

  decode(value: number, result: ColorData, startIndex?: number, format?: ColorFormat) {
    return Color.decodeRgb(value, result, startIndex, format);
  }

  fromRgb(rgb: number): number;
  fromRgb(r: number, g: number, b: number, a: number): number;
  fromRgb(param1: number, g?: number, b?: number, a?: number): number {
    return arguments.length === 1 ? param1 : Color.encodeRgb(param1, g!, b!, a);
  }

  toRgb(value: number): number;
  toRgb(value: number, result: ColorData, startIndex?: number, format?: ColorFormat): ColorData;
  toRgb(value: number, result?: ColorData, startIndex?: number, format?: ColorFormat): number | ColorData {
    return result ? Color.decodeRgb(value, result, startIndex, format) : value;
  }

  parse(text: string) {
    return this.parseSingleHex(text) || this.parseDoubleHex(text);
  }

  // @ts-ignore - unused param.
  toString(value: number, format?: ColorFormat, precision?: number) {
    const a = value & 0xFF;

    switch (format || "hexa") {
      case "hexa":
        return `#${MathEx.toHex(value).toUpperCase()}`;

      case "hex":
      default:
        if (a === 255)
          value >>>= 8;

        return `#${MathEx.toHex(value).toUpperCase()}`;
    }
  }

  protected parseSingleHex(value: string) {
    const m = value.match(/^\s*#([0-9A-F])([0-9A-F])([0-9A-F])([0-9A-F])?\s*$/i);

    if (!m) return undefined;

    let a = 1;
    const r = MathEx.parseHex(m[1] + m[1]);
    const g = MathEx.parseHex(m[2] + m[2]);
    const b = MathEx.parseHex(m[3] + m[3]);

    if (m[4] !== undefined)
      a = MathEx.parseHex(m[4] + m[4]);

    return Color.encodeRgb(r, g, b, a, "hexa255");
  }

  protected parseDoubleHex(value: string) {
    const m = value.match(/^\s*#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})?\s*$/i);

    if (!m) return undefined;

    let a = 1;
    const r = MathEx.parseHex(m[1]);
    const g = MathEx.parseHex(m[2]);
    const b = MathEx.parseHex(m[3]);

    if (m[4] !== undefined)
      a = MathEx.parseHex(m[4]);

    return Color.encodeRgb(r, g, b, a, "hexa255");
  }
}

Color.addConverter(new HexConverter());
