import { Color, ColorData, ColorFormat } from '.';

export class SColor extends Color {
  constructor();
  constructor(colorValue: number, format: ColorFormat);
  constructor(r: number, g: number, b: number, a?: number, freeze?: boolean, name?: string, isWebColor?: boolean);
  constructor(hsl: "hsl", h: number, s: number, l: number, a?: number, freeze?: boolean, name?: string, isWebColor?: boolean);
  constructor(format: ColorFormat, values: ColorData, startIndex?: number, freeze?: boolean, name?: string, isWebColor?: boolean);
  constructor(text: string, freeze?: boolean, name?: string, isWebColor?: boolean);
  constructor(param1?: any, param2?: any, param3?: any, param4?: any, param5?: any, param6?: any, param7?: any, param8?: any) {
    super();

    let freeze = false;
    let name: string | null = null;
    let isWeb = false;

    if (arguments.length === 0) {
    } else if (typeof (param1) === "number" && typeof (param2) === "string") {
      this.changeConverter(<ColorFormat>param2);
      this._value = param1;
    } else if (typeof (param1) === "number" && typeof (param2) === "number") {
      this.changeConverter("rgb");
      this._value = this._converter.fromRgb(param1, param2, param3, param4 === undefined ? 1 : param4);
      freeze = param5 !== undefined && param5;
      name = param6 || null;
      isWeb = param7 || false;
    } else if (param1 === "hsl") {
      this.changeConverter(param1);
      const a = param5 === undefined ? 1 : param5;
      this._value = this._converter.encode([param2, param3, param4, a], 0, param1);
      freeze = param6 !== undefined && param6;
      name = param7 || null;
      isWeb = param8 || false;
    } else if (param2 !== undefined && typeof (param2) !== "boolean") {
      this.changeConverter(param1);
      this._value = this._converter.encode(param2, param3, param1);
      freeze = param4 !== undefined && param4;
      name = param5 || null;
      isWeb = param6 || false;
    } else {
      if (!this.parseFrom(param1))
        throw new Error(`Unsupported color format "${param1}"`);

      freeze = param2 !== undefined && param2;
      name = param3 || null;
      isWeb = param4 || false;
    }

    if (name) {
      this._name = name;

      if (isWeb) {
        this.setFlag(Color.FLAG_WEB);
        freeze = true;
      }
    }

    if (!this.isWebColor)
      this.dirty();

    if (freeze) this.freeze();
  }

  get r() { return this.getRgb(0); }
  set r(value) { this.setRgb(0, value); }

  get g() { return this.getRgb(1); }
  set g(value) { this.setRgb(1, value); }

  get b() { return this.getRgb(2); }
  set b(value) { this.setRgb(2, value); }

  get h() { return this.getHsl(0); }
  set h(value) { this.setHsl(0, value); }

  get s() { return this.getHsl(1); }
  set s(value) { this.setHsl(1, value); }

  get l() { return this.getHsl(2); }
  set l(value) { this.setHsl(2, value); }

  get a() { return this._converter.getAlpha(this._value); }
  set a(value) {
    this.checkFrozen();
    this._value = this._converter.setAlpha(value, this._value);
  }

  get aPercent() { return this._converter.getAlphaPercent(this._value); }
  set aPercent(value) {
    this.checkFrozen();
    this._value = this._converter.setAlphaPercent(value, this._value);
  }

  get rPercent() { return this.r * Color.ONE_255_TIMES_100; }
  set rPercent(value) { this.r = value * Color.TWO55_DIV_100; }
  get red() { return this.r; }
  set red(value) { this.r = value; }
  get redPercent() { return this.rPercent; }
  set redPercent(value) { this.rPercent = value; }

  get gPercent() { return this.g * Color.ONE_255_TIMES_100; }
  set gPercent(value) { this.g = value * Color.TWO55_DIV_100; }
  get green() { return this.g; }
  set green(value) { this.g = value; }
  get greenPercent() { return this.gPercent; }
  set greenPercent(value) { this.gPercent = value; }

  get bPercent() { return this.b * Color.ONE_255_TIMES_100; }
  set bPercent(value) { this.b = value * Color.TWO55_DIV_100; }
  get blue() { return this.b; }
  set blue(value) { this.b = value; }
  get bluePercent() { return this.bPercent; }
  set bluePercent(value) { this.bPercent = value; }

  get hue() { return this.h; }
  set hue(value) { this.h = value; }
  get sat() { return this.s; }
  set sat(value) { this.s = value; }
  get saturation() { return this.s; }
  set saturation(value) { this.s = value; }
  get light() { return this.l; }
  set light(value) { this.l = value; }
  get lightness() { return this.l; }
  set lightness(value) { this.l = value; }

  get alpha() { return this.a; }
  set alpha(value) { this.a = value; }
  get alphaPercent() { return this.aPercent; }
  set alphaPercent(value) { this.aPercent = value; }

  get(channel: number | string, format?: ColorFormat) {
    if (format && !this.converterHasFormat(format))
      this.changeConverter(format);

    return this._converter.get(channel, this._value);
  }

  set(channel: number | string, newValue: number, format?: ColorFormat) {
    if (format && !this.converterHasFormat(format))
      this.changeConverter(format);

    this._value = this._converter.set(channel, newValue, this._value);
    this.dirty();
  }

  withRed(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.r = value;
    return result;
  }

  withRedPercent(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.rPercent = value;
    return result;
  }

  withGreen(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.g = value;
    return result;
  }

  withGreenPercent(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.gPercent = value;
    return result;
  }

  withHue(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.h = value;
    return result;
  }

  withSat(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.s = value;
    return result;
  }

  withSaturation(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.s = value;
    return result;
  }

  withLight(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.l = value;
    return result;
  }

  withLightness(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.l = value;
    return result;
  }

  withAlpha(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.a = value;
    return result;
  }

  withAlphaPercent(value: number) {
    const result = this.isFrozen ? this.clone() : this;
    result.aPercent = value;
    return result;
  }

  clone() { return new SColor(this._value, this._converter.formats[0]); }

  protected changeConverter(format: ColorFormat) {
    const rgbValue = this._converter.toRgb(this._value);
    this._converter = Color.getConverter(format);
    this._value = this._converter.fromRgb(rgbValue);
  }

  protected getRgb(index: number) {
    if (!this._converter.isRgb)
      this.changeConverter("rgba");

    return this._converter.get(index, this._value);
  }

  protected setRgb(index: number, value: number) {
    this.checkFrozen();

    if (!this._converter.isRgb)
      this.changeConverter("rgba");

    this._value = this._converter.set(index, value, this._value);
    this.dirty();
  }

  protected getHsl(index: number) {
    if (!this._converter.isHsl)
      this.changeConverter("hsla");

    return this._converter.get(index, this._value);
  }

  protected setHsl(index: number, value: number) {
    this.checkFrozen();

    if (!this._converter.isHsl)
      this.changeConverter("hsla");

    this._value = this._converter.set(index, value, this._value);
    this.dirty();
  }
}
