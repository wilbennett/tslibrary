import { Matrix, Matrix2, MatrixValues } from '../../matrix';

class CanvasProps {
    constructor(public readonly context?: CanvasContext, public readonly ctx?: CanvasRenderingContext2D) {
    }

    //================================================================================================================
    // CanvasCompositing
    //================================================================================================================
    // globalAlpha: number;
    // globalCompositeOperation: string;
    //================================================================================================================
    // CanvasImageSmoothing
    //================================================================================================================
    // imageSmoothingEnabled: boolean;
    // imageSmoothingQuality: ImageSmoothingQuality;
    //================================================================================================================
    // CanvasFillStrokeStyles
    //================================================================================================================
    // fillStyle: string | CanvasGradient | CanvasPattern;
    // strokeStyle: string | CanvasGradient | CanvasPattern;
    //================================================================================================================
    // CanvasShadowStyles
    //================================================================================================================
    // shadowBlur: number;
    // shadowColor: string;
    // shadowOffsetX: number;
    // shadowOffsetY: number;
    //================================================================================================================
    // CanvasFilters
    //================================================================================================================
    // filter: string;
    //================================================================================================================
    // CanvasPathDrawingStyles
    //================================================================================================================
    // lineCap: CanvasLineCap;
    // lineDashOffset: number;
    // lineJoin: CanvasLineJoin;
    // lineWidth: number;
    // miterLimit: number;
    // getLineDash(): number[];
    // setLineDash(segments: number[]): void;
    //================================================================================================================
    // CanvasTextDrawingStyles
    //================================================================================================================
    // direction: CanvasDirection;
    // font: string;
    // textAlign: CanvasTextAlign;
    // textBaseline: CanvasTextBaseline;

    //================================================================================================================
    //================================================================================================================

    clone(context?: CanvasContext, ctx?: CanvasRenderingContext2D) {
        const result = new CanvasProps(context, ctx);
        return result;
    }

    assignFrom(other: CanvasProps) {
        other;
        return this;
    }

    copyFromContext(ctx?: CanvasRenderingContext2D) {
        ctx = ctx || this.ctx;

        if (!ctx) return this;

        return this;
    }

    copyToContext(ctx: CanvasRenderingContext2D) {
        ctx = ctx || this.ctx;

        if (!ctx) return this;

        return this;
    }
}

export class CanvasContext {
    protected _matrix: Matrix;
    protected _props: CanvasProps;
    protected _propsStack: CanvasProps[];

    constructor(canvas: HTMLCanvasElement);
    constructor(ctx: CanvasRenderingContext2D);
    constructor(param1: HTMLCanvasElement | CanvasRenderingContext2D) {
        if (param1 instanceof HTMLCanvasElement) {
            const ctx = param1.getContext("2d");

            if (!ctx)
                throw new Error("No 2D context found.");

            this.ctx = ctx;
        } else {
            this.ctx = param1;
        }

        this._matrix = Matrix2.create();
        this._props = new CanvasProps(this, this.ctx);
        this._props.copyFromContext();
        this._propsStack = [];
    }

    readonly ctx: CanvasRenderingContext2D;

    get transformation() { return this._matrix.values; }
    get inverse() { return this._matrix.inverse; }

    getTransform(result: MatrixValues): MatrixValues { return this._matrix.getValues(result); }
    getInverse(result: MatrixValues): MatrixValues { return this._matrix.getInverse(result); }

    setTransform(values: MatrixValues) {
        this._matrix.set(values);
        return this.updateCtxTransform();
    }

    transform(values: MatrixValues) {
        this._matrix.mult(values);
        return this.updateCtxTransform();
    }

    pushProps() {
        const styles = this.cloneData();
        this._propsStack.push(styles);
        return this;
    }

    popProps() {
        const style = this._propsStack.pop();

        if (!style)
            throw new Error("Unbalanced properties pop.");

        this._props.assignFrom(style);
        this._props.copyToContext(this.ctx);
        return this;
    }

    pushTransform() {
        this._matrix.push();
        return this;
    }

    popTransform() {
        this._matrix.pop();
        return this;
    }

    //================================================================================================================
    // Canvas State
    //================================================================================================================
    save() {
        this.pushProps();
        this.pushTransform();
        return this;
    }

    restore() {
        this.popProps();
        this.popTransform();
        return this;
    }

    //================================================================================================================
    // CanvasTransform
    //================================================================================================================
    // getTransform(): DOMMatrix;
    // resetTransform(): void;
    // rotate(angle: number): void;
    // scale(x: number, y: number): void;
    // setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    // setTransform(transform?: DOMMatrix2DInit): void;
    // transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    // translate(x: number, y: number): void;
    //================================================================================================================
    // CanvasCompositing
    //================================================================================================================
    // globalAlpha: number;
    // globalCompositeOperation: string;
    //================================================================================================================
    // CanvasImageSmoothing
    //================================================================================================================
    // imageSmoothingEnabled: boolean;
    // imageSmoothingQuality: ImageSmoothingQuality;
    //================================================================================================================
    // CanvasFillStrokeStyles
    //================================================================================================================
    // fillStyle: string | CanvasGradient | CanvasPattern;
    // strokeStyle: string | CanvasGradient | CanvasPattern;
    // createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    // createPattern(image: CanvasImageSource, repetition: string): CanvasPattern | null;
    // createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    //================================================================================================================
    // CanvasShadowStyles
    //================================================================================================================
    // shadowBlur: number;
    // shadowColor: string;
    // shadowOffsetX: number;
    // shadowOffsetY: number;
    //================================================================================================================
    // CanvasFilters
    //================================================================================================================
    // filter: string;
    //================================================================================================================
    // CanvasRect
    //================================================================================================================
    // clearRect(x: number, y: number, w: number, h: number): void;
    // fillRect(x: number, y: number, w: number, h: number): void;
    // strokeRect(x: number, y: number, w: number, h: number): void;
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
    // lineCap: CanvasLineCap;
    // lineDashOffset: number;
    // lineJoin: CanvasLineJoin;
    // lineWidth: number;
    // miterLimit: number;
    // getLineDash(): number[];
    // setLineDash(segments: number[]): void;
    //================================================================================================================
    // CanvasTextDrawingStyles
    //================================================================================================================
    // direction: CanvasDirection;
    // font: string;
    // textAlign: CanvasTextAlign;
    // textBaseline: CanvasTextBaseline;
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

    //================================================================================================================
    // Protected
    //================================================================================================================
    protected cloneData() { return this._props.clone(); }

    protected updateCtxTransform() {
        const transform = this.transformation;
        this.ctx.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
        return this;
    }
}
