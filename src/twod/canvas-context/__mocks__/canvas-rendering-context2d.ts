import { Style } from '..';

export class CanvasRenderingContext2D {
    //================================================================================================================
    // Canvas State
    //================================================================================================================
    save() {
    }

    restore() {
    }

    //================================================================================================================
    // CanvasTransform
    //================================================================================================================
    transformation: number[] = [];
    // getTransform(): DOMMatrix;
    // resetTransform(): void;
    // rotate(angle: number): void;
    // scale(x: number, y: number): void;
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
        this.transformation = [a, b, c, d, e, f];
    }
    // setTransform(transform?: DOMMatrix2DInit): void;
    // transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    // translate(x: number, y: number): void;
    //================================================================================================================
    // CanvasCompositing
    //================================================================================================================
    globalAlpha: number = 1;
    globalCompositeOperation: string = "source-over";
    //================================================================================================================
    // CanvasImageSmoothing
    //================================================================================================================
    imageSmoothingEnabled: boolean = false;
    imageSmoothingQuality: ImageSmoothingQuality = "low";
    //================================================================================================================
    // CanvasFillStrokeStyles
    //================================================================================================================
    fillStyle: Style = "#000000";
    strokeStyle: Style = "#000000";

    // @ts-ignore - unused param.
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient | null {
        return null;
    }

    // @ts-ignore - unused param.
    createPattern(image: CanvasImageSource, repetition: string): CanvasPattern | null { return null; }

    // @ts-ignore - unused param.
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient | null {
        return null;
    }
    //================================================================================================================
    // CanvasShadowStyles
    //================================================================================================================
    shadowBlur: number = 0;
    shadowColor: string = "#000000";
    shadowOffsetX: number = 0;
    shadowOffsetY: number = 0;
    //================================================================================================================
    // CanvasFilters
    //================================================================================================================
    // filter: string; //* Proposal.
    //================================================================================================================
    // CanvasRect
    //================================================================================================================
    // @ts-ignore - unused param.
    clearRect(x: number, y: number, w: number, h: number): void { }
    // @ts-ignore - unused param.
    fillRect(x: number, y: number, w: number, h: number): void { }
    // @ts-ignore - unused param.
    strokeRect(x: number, y: number, w: number, h: number): void { }
    //================================================================================================================
    // CanvasDrawPath
    //================================================================================================================
    // beginPath(): void;
    // clip(fillRule?: CanvasFillRule): void;
    // clip(path: Path2D, fillRule?: CanvasFillRule): void;
    // fill(fillRule?: CanvasFillRule): void;
    // fill(path: Path2D, fillRule?: CanvasFillRule): void;
    // isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
    // isPointInPath(path: Path2D, x: number, y: number, fillRule?: CanvasFillRule): boolean;
    // isPointInStroke(x: number, y: number): boolean;
    // isPointInStroke(path: Path2D, x: number, y: number): boolean;
    // stroke(): void;
    // stroke(path: Path2D): void;
    //================================================================================================================
    // CanvasUserInterface
    //================================================================================================================
    // drawFocusIfNeeded(element: Element): void;
    // drawFocusIfNeeded(path: Path2D, element: Element): void;
    // scrollPathIntoView(): void;
    // scrollPathIntoView(path: Path2D): void;
    //================================================================================================================
    // CanvasText
    //================================================================================================================
    // fillText(text: string, x: number, y: number, maxWidth?: number): void;
    // measureText(text: string): TextMetrics;
    // strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    //================================================================================================================
    // CanvasDrawImage
    //================================================================================================================
    // drawImage(image: CanvasImageSource, dx: number, dy: number): void;
    // drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
    // drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
    //================================================================================================================
    // CanvasImageData
    //================================================================================================================
    // createImageData(sw: number, sh: number): ImageData;
    // createImageData(imagedata: ImageData): ImageData;
    // getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    // putImageData(imagedata: ImageData, dx: number, dy: number): void;
    // putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
    //================================================================================================================
    // CanvasPathDrawingStyles
    //================================================================================================================
    lineCap: CanvasLineCap = "butt";
    lineDashOffset: number = 0;
    lineJoin: CanvasLineJoin = "miter";
    lineWidth: number = 1;
    miterLimit: number = 10;
    // lineDash: number[] = [];
    // getLineDash(): number[];
    // setLineDash(segments: number[]): void;
    //================================================================================================================
    // CanvasTextDrawingStyles
    //================================================================================================================
    font: string = "10px sans-serif";
    textAlign: CanvasTextAlign = "start";
    textBaseline: CanvasTextBaseline = "alphabetic";
    // direction: CanvasDirection; //* Proposal.
    //================================================================================================================
    // CanvasPath
    //================================================================================================================
    // arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    // arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    // bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    // closePath(): void;
    // ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    // lineTo(x: number, y: number): void;
    // moveTo(x: number, y: number): void;
    // quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    // rect(x: number, y: number, w: number, h: number): void;
}
