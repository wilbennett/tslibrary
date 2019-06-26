import { Color } from '../../colors';


export type CanvasColor = string | Color;
export type Brush = CanvasColor | CanvasGradient | CanvasPattern;

export const enum Composition {
    sourceOver = "source-over",
    sourceIn = "source-in",
    sourceOut = "source-out",
    sourceAtop = "source-atop",
    destinationOver = "destination-over",
    destinationIn = "destination-in",
    destinationOut = "destination-out",
    destinationAtop = "destination-atop",
    lighter = "lighter",
    copy = "copy",
    xor = "xor",
    multiply = "multiply",
    screen = "screen",
    overlay = "overlay",
    darken = "darken",
    lighten = "lighten",
    colorDodge = "color-dodge",
    colorBurn = "color-burn",
    hardLight = "hard-light",
    softLight = "soft-light",
    difference = "difference",
    exclusion = "exclusion",
    hue = "hue",
    saturation = "saturation",
    color = "color",
    luminosity = "luminosity"
}

export type Compositions =
    | "source-over"
    | "source-in"
    | "source-out"
    | "source-atop"
    | "destination-over"
    | "destination-in"
    | "destination-out"
    | "destination-atop"
    | "lighter"
    | "copy"
    | "xor"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity";
