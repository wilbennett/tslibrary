import { ColorData, ColorFormat } from '..';

export abstract class ColorConverter {
  public static A_PRECISION = 2;
  abstract get formats(): ColorFormat[];
  get channelCount() { return 4; }
  get isRgb() { return false; }
  get isHsl() { return false; }
  abstract getAlpha(currentValue: number): number;
  abstract setAlpha(value: number, currentValue: number): number;
  abstract getAlphaPercent(currentValue: number): number;
  abstract setAlphaPercent(value: number, currentValue: number): number;
  abstract get(channel: number | string, currentValue: number, format?: ColorFormat): number;
  abstract set(channel: number | string, newValue: number, currentValue: number, format?: ColorFormat): number;
  abstract encode(values: ColorData, startIndex?: number, format?: ColorFormat): number;
  abstract decode(value: number, result: ColorData, startIndex?: number, format?: ColorFormat): ColorData;
  abstract fromRgb(r: number, g: number, b: number, a: number): number;
  abstract fromRgb(rgb: number): number;
  abstract toRgb(value: number): number;
  abstract toRgb(value: number, result: ColorData, startIndex?: number, format?: ColorFormat): ColorData;
  abstract parse(text: string): number | undefined;
  abstract toString(value: number, format?: ColorFormat, precision?: number): string;
}

