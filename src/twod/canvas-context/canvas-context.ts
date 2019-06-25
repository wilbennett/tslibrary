import { Matrix, Matrix2, MatrixValues } from '../../matrix';
import { Vector } from '../../vectors';

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

        // if (!ctx) return this;

        return this;
    }

    copyToContext(ctx: CanvasRenderingContext2D) {
        ctx;
        // ctx = ctx || this.ctx;

        // if (!ctx) return this;

        return this;
    }
}

// TODO: Lazy update canvas transform.
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
        this.updateCtxTransform();
    }

    readonly ctx: CanvasRenderingContext2D;

    pushProps() {
        const props = this.cloneData();
        this._propsStack.push(props);
        return this;
    }

    popProps() {
        const props = this._propsStack.pop();

        if (!props)
            throw new Error("Unbalanced properties pop.");

        this._props.assignFrom(props);
        this._props.copyToContext(this.ctx);
        return this;
    }

    protected cloneData() { return this._props.clone(); }

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
    get transformation() { return this._matrix.values; }
    get inverse() { return this._matrix.inverse; }

    getTransform(result: MatrixValues) { return this._matrix.getValues(result); }
    getInverse(result: MatrixValues) { return this._matrix.getInverse(result); }

    createValues() { return this._matrix.createValues(); }
    getIdentity(result: MatrixValues) { return this._matrix.getIdentity(result); }
    createIdentity() { return this._matrix.createIdentity(); }

    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): this;
    setTransform(values: MatrixValues): this;
    setTransform(param1: number | MatrixValues, b?: number, c?: number, d?: number, e?: number, f?: number): this {
        if (typeof param1 === "number") {
            const transformation: MatrixValues = this.transformation;
            transformation[0] = param1;
            transformation[1] = b!;
            transformation[2] = c!;
            transformation[3] = d!;
            transformation[4] = e!;
            transformation[5] = f!;
        } else {
            this._matrix.set(param1);
        }

        return this.updateCtxTransform();
    }

    transform(a: number, b: number, c: number, d: number, e: number, f: number): this;
    transform(values: MatrixValues): this;
    transform(param1: number | MatrixValues, b?: number, c?: number, d?: number, e?: number, f?: number): this {
        if (typeof param1 === "number") {
            const values = this.createValues();
            values[0] = param1;
            values[1] = b!;
            values[2] = c!;
            values[3] = d!;
            values[4] = e!;
            values[5] = f!;
            this._matrix.mult(values);
        } else {
            this._matrix.mult(param1);
        }

        return this.updateCtxTransform();
    }

    setToIdentity() {
        this._matrix.setToIdentity();
        return this.updateCtxTransform();
    }

    resetTransform() {
        this._matrix.reset();
        return this.updateCtxTransform();
    }

    transformPoint(point: Vector): Vector { return this._matrix.transform(point); }
    transformPointInverse(point: Vector): Vector { return this._matrix.transformInverse(point); }

    translate(value: Vector): this;
    translate(x: number, y: number): this;
    // @ts-ignore - unused param.
    translate(param1: Vector | number, y?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.translate(...arguments);
        return this.updateCtxTransform();
    }

    rotate(radians: number): this;
    rotate(radians: number, center: Vector): this;
    rotate(radians: number, centerX: number, centerY: number): this;
    // @ts-ignore - unused param.
    rotate(radians: number, param2?: number | Vector, centerY?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.rotate2D(...arguments);
        return this.updateCtxTransform();
    }

    rotateDegrees(degrees: number): this;
    rotateDegrees(degrees: number, center: Vector): this;
    rotateDegrees(degrees: number, centerX: number, centerY: number): this;
    // @ts-ignore - unused param.
    rotateDegrees(degrees: number, param2?: number | Vector, centerY?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.rotateDegrees2D(...arguments);
        return this.updateCtxTransform();
    }

    skew(value: Vector): this;
    skew(radiansX: number, radiansY: number): this;
    // @ts-ignore - unused param.
    skew(param1: Vector | number, radiansY?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.skew(...arguments);
        return this.updateCtxTransform();
    }

    skewDegrees(value: Vector): this;
    skewDegrees(degreesX: number, degreesY: number): this;
    // @ts-ignore - unused param.
    skewDegrees(param1: Vector | number, degreesY?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.skewDegrees(...arguments);
        return this.updateCtxTransform();
    }

    skewX(radiansX: number): this {
        this._matrix.skewX(radiansX);
        return this.updateCtxTransform();
    }

    skewXDegrees(radiansX: number): this {
        this._matrix.skewXDegrees(radiansX);
        return this.updateCtxTransform();
    }

    skewY(radiansY: number): this {
        this._matrix.skewY(radiansY);
        return this.updateCtxTransform();
    }

    skewYDegrees(degreesY: number): this {
        this._matrix.skewYDegrees(degreesY);
        return this.updateCtxTransform();
    }

    scale(value: Vector): this;
    scale(value: number): this;
    scale(x: number, y: number): this;
    // @ts-ignore - unused param.
    scale(param1: Vector | number, y?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.scale(...arguments);
        return this.updateCtxTransform();
    }

    // getTransform(): DOMMatrix; //* Proposal.
    // setTransform(transform?: DOMMatrix2DInit): void; //* Proposal.

    pushTransform() {
        this._matrix.push();
        return this;
    }

    popTransform() {
        this._matrix.pop();
        return this.updateCtxTransform();
    }

    protected updateCtxTransform() {
        const transform = this.transformation;
        this.ctx.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
        return this;
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
}
