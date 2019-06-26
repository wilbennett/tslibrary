import { Color } from '../../colors';


export type CanvasColor = string | Color;
export type Brush = CanvasColor | CanvasGradient | CanvasPattern;

export const enum CompositeOperation {
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
