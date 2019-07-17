import { Color } from '.';

export type CanvasColor = string | Color;

export type ColorFormat = "hex" | "hexa" | "hexa255" | "hexfrac" | "hexafrac"
  | "rgb" | "rgba" | "rgbpct" | "rgbapct" | "rgba255" | "rgbfrac" | "rgbafrac"
  | "hsl" | "hsla" | "hslpct" | "hslapct"
  | "hsldeg" | "hsladeg" | "hsldegpct" | "hsladegpct"
  | "hslrad" | "hslarad" | "hslradpct" | "hslaradpct"
  | "hslturn" | "hslaturn" | "hslturnpct" | "hslaturnpct";

export type ColorData = number[] | Float32Array;
