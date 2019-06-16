import { ColorData, ColorFormat, Colors } from '.';
import { MathEx } from '../core';
import { ColorConverter } from './converters';

export abstract class Color {
  public static readonly TWO55_DIV_100 = 255 * 0.01;
  public static readonly ONE_255_TIMES_100 = 1 / 255 * 100;
  public static readonly ONE_255TH = 1 / 255;
  public static readonly ONE_360TH = 1 / 360;

  protected static readonly FLAG_DIRTY = 1 << 0;
  protected static readonly FLAG_FROZEN = 1 << 1;
  protected static readonly FLAG_WEB = 1 << 2;
  protected static readonly FLAG_WEB2 = 1 << 3;

  protected static _converters = new Map<ColorFormat, ColorConverter>();
  protected _converter: ColorConverter;
  protected _value: number;
  protected _flags: number = 0;

  constructor() {
    this._value = 0;
    this._converter = Color._converters.values().next().value;
  }

  get rgbValue() { return (this._converter.isRgb ? this._value : this._converter.toRgb(this._value)); }
  get id() { return this.rgbValue; }
  get colorValue() { return this._value; }
  get channelCount() { return this._converter.channelCount; }
  get converter() { return this._converter; }
  static get converters() { return Array.from(new Set<ColorConverter>(this._converters.values())); }

  protected _name?: string | null;

  get name(): string | null | undefined {
    if (!this._name && this.isWebColor) {
      const color = Colors.get(this.id);

      if (color)
        return color.name;
    }

    return this._name || null;
  }
  set name(value) {
    this.checkFrozen();

    if (value)
      this._name = value;
    else if (this._name) {
      this._name = undefined;
    }

    this.clearFlag(Color.FLAG_WEB | Color.FLAG_WEB2);
    this.dirty();
  }

  get isFrozen() { return this.hasFlag(Color.FLAG_FROZEN); }

  get isWebColor() {
    if (this.isDirty) {
      this.clean();
      this.updateIsWebColor();
    }

    return this.hasFlag(Color.FLAG_WEB | Color.FLAG_WEB2);
  }

  get(channel: number | string, format?: ColorFormat) {
    if (!format || this.converterHasFormat(format))
      return this._converter.get(channel, this._value);

    return 0;
  }

  set(channel: number | string, newValue: number, format?: ColorFormat) {
    if (!format || this.converterHasFormat(format)) {
      this._value = this._converter.set(channel, newValue, this._value);
      this.dirty();
    }
  }

  freeze() { this.setFlag(Color.FLAG_FROZEN); return this; }

  withName(name?: string) {
    const result = this.isFrozen ? this.clone() : this;
    result.name = name;
    return result;
  }

  setWebColor(value: boolean = true) {
    this.checkFrozen();

    if (value) {
      if (this._name)
        this.setFlag(Color.FLAG_WEB);
    } else
      this.clearFlag(Color.FLAG_WEB | Color.FLAG_WEB2);

    this.dirty();
    return this;
  }

  abstract clone(): Color;

  asFrozen(name?: string) {
    return this.isFrozen ? this : this.clone().withName(name).freeze();
  }

  asUnfrozen(name?: string) {
    return this.isFrozen ? this.clone().withName(name) : this;
  }

  equals(other: Color) { return this.id === other.id; }

  toString(useWebName: boolean = true, format?: ColorFormat, precision?: number) {
    if (useWebName && this.isWebColor) {
      const color = Colors.get(this.id);

      if (color)
        return color.name;
    }

    if (!format || this.converterHasFormat(format))
      return this._converter.toString(this._value, format, precision);

    return Color.getConverter(format).toString(this._value, format, precision);
  }

  protected converterHasFormat(format: ColorFormat, converter?: ColorConverter) {
    converter = converter || this._converter;
    return this._converter.formats.find(f => f === format) !== undefined;
  }

  protected parseFrom(text: string) {
    const existing = Colors.get(text);

    if (existing) {
      this._value = existing.colorValue;
      this._converter = existing.converter;

      if (existing.name)
        this._name = existing.name;

      return true;
    }

    const converters = Color.converters;

    for (const converter of converters) {
      const value = converter.parse(text);

      if (value === undefined) continue;

      this._value = value;
      this._converter = converter;
      return true;
    }

    return false;
  }

  protected isDirty() { return this.hasFlag(Color.FLAG_DIRTY); }
  protected dirty() { this.setFlag(Color.FLAG_DIRTY); }
  protected clean() { this.clearFlag(Color.FLAG_DIRTY); }

  protected checkFrozen() {
    if (this.isFrozen)
      throw new Error("Cannot modify a frozen color.");
  }

  protected updateIsWebColor() {
    const existing = Colors.get(this.id);
    this.updateFlag(Color.FLAG_WEB2, existing && existing !== this && existing.isWebColor);
  }

  protected hasFlag(flag: number) { return (this._flags & flag) !== 0; }
  protected setFlag(flag: number) { this._flags |= flag; }
  protected clearFlag(flag: number) { this._flags &= ~flag; }

  protected updateFlag(flag: number, set: boolean) {
    if (set)
      this.setFlag(flag);
    else
      this.clearFlag(flag);
  }

  static encodeRgb(r: number, g: number, b: number, a?: number, format?: ColorFormat) {
    switch (format) {
      case "rgbpct":
      case "rgbapct":
        if (a === undefined)
          a = 100;

        r = MathEx.clamp(r, 0, 100) * Color.TWO55_DIV_100;
        g = MathEx.clamp(g, 0, 100) * Color.TWO55_DIV_100;
        b = MathEx.clamp(b, 0, 100) * Color.TWO55_DIV_100;
        a = MathEx.clamp(a, 0, 100) * 0.01;
        break;

      case "rgba255":
      case "hexa255":
        if (a === undefined)
          a = 1;

        a = MathEx.clampByte(a) * Color.ONE_255TH;
        break;
    }

    if (a === undefined)
      a = 1;

    let result = MathEx.clampByte(Math.round(r));
    result <<= 8;
    result |= MathEx.clampByte(Math.round(g));
    result <<= 8;
    result |= MathEx.clampByte(Math.round(b));
    result <<= 8;
    result |= Math.round(MathEx.clamp(a, 0, 1) * 255);
    return result;
  }

  static decodeRgb(rgb: number, result: ColorData, startIndex: number = 0, format?: ColorFormat): ColorData {
    rgb = Math.round(rgb);
    let a = (rgb & 0xFF) * Color.ONE_255TH;
    rgb >>= 8;
    let b = rgb & 0xFF;
    rgb >>= 8;
    let g = rgb & 0xFF;
    rgb >>= 8;
    let r = rgb & 0xFF;

    switch (format) {
      case "rgbpct":
      case "rgbapct":
        r = Math.round(r * Color.ONE_255_TIMES_100);
        g = Math.round(g * Color.ONE_255_TIMES_100);
        b = Math.round(b * Color.ONE_255_TIMES_100);
        a = Math.round(a * 100);
        break;

      case "rgba255":
      case "hexa255":
        a = Math.round(a * 255);
        break;

      case "hexfrac":
      case "hexafrac":
      case "rgbfrac":
      case "rgbafrac":
        r = r * Color.ONE_255TH;
        g = g * Color.ONE_255TH;
        b = b * Color.ONE_255TH;
        break;
    }

    result[startIndex + 0] = r;
    result[startIndex + 1] = g;
    result[startIndex + 2] = b;

    if (!format || format.startsWith("rgba") || format.startsWith("hexa"))
      result[startIndex + 3] = a;

    return result;
  }

  static encodeHsl(h: number, s: number, l: number, a?: number, format?: ColorFormat) {
    format = format || "hsl";

    if (format.endsWith("pct")) {
      if (a === undefined)
        a = 100;

      a = MathEx.clamp(a, 0, 100) * 0.01;
    }

    if (a === undefined)
      a = 1;

    switch (format) {
      case "hslrad":
      case "hslarad":
      case "hslradpct":
      case "hslaradpct":
        h = MathEx.toDegrees(h);
        break;

      case "hslturn":
      case "hslaturn":
      case "hslturnpct":
      case "hslaturnpct":
        h *= 360;
        break;
    }

    let result = MathEx.wrapDegrees(Math.round(h));
    result <<= 7;
    result |= MathEx.clamp(Math.round(s), 0, 100);
    result <<= 7;
    result |= MathEx.clamp(Math.round(l), 0, 100);
    result <<= 7;
    result |= Math.round(MathEx.clamp(a, 0, 1) * 100);
    return result;
  }

  static decodeHsl(hsl: number, result: ColorData, startIndex: number = 0, format?: ColorFormat): ColorData {
    format = format || "hsla";
    hsl = Math.round(hsl);
    let a = (hsl & 0x7F) * 0.01;
    hsl >>>= 7;
    let l = hsl & 0x7F;
    hsl >>>= 7;
    let s = hsl & 0x7F;
    hsl >>>= 7;
    let h = hsl & 0x1FF;

    if (format.endsWith("pct"))
      a = Math.round(a * 100);

    switch (format) {
      case "hslrad":
      case "hslarad":
      case "hslradpct":
      case "hslaradpct":
        h = MathEx.toRadians(h);
        break;

      case "hslturn":
      case "hslaturn":
      case "hslturnpct":
      case "hslaturnpct":
        h *= Color.ONE_360TH;
        break;
    }

    result[startIndex + 0] = h;
    result[startIndex + 1] = s;
    result[startIndex + 2] = l;

    if (!format || format.startsWith("hsla"))
      result[startIndex + 3] = a;

    return result;
  }

  static calcLuminance(r: number, g: number, b: number) {
    r *= this.ONE_255TH;
    g *= this.ONE_255TH;
    b *= this.ONE_255TH;

    const mult1 = 1 / 12.92;
    const mult2 = 1 / 1.055;

    r = r <= 0.03928 ? r * mult1 : Math.pow((r + 0.055) * mult2, 2.4);
    g = g <= 0.03928 ? g * mult1 : Math.pow((g + 0.055) * mult2, 2.4);
    b = b <= 0.03928 ? b * mult1 : Math.pow((b + 0.055) * mult2, 2.4);

    return r * 0.2126 + g * 0.7152 + b * 0.0722;
  }

  static calcContrast(color1: Color, color2: Color) {
    const rgb1: number[] = [0, 0, 0];
    const rgb2: number[] = [0, 0, 0];
    this.decodeRgb(color1.rgbValue, rgb1);
    this.decodeRgb(color2.rgbValue, rgb2);
    const l1 = this.calcLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = this.calcLuminance(rgb2[0], rgb2[1], rgb2[2]);

    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  static calcKey(r: number, g: number, b: number, a?: number) {
    return this.encodeRgb(r, g, b, a);
  }

  static addConverter(converter: ColorConverter) {
    converter.formats.forEach(f => this._converters.set(f, converter));
  }

  protected static getConverter(format: ColorFormat) {
    const result = this._converters.get(format);

    if (!result) throw new Error(`No converters registered for "${format}".`);

    return result;
  }
}
