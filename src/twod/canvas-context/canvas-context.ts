import { Brush, CanvasColor, Compositions, Style } from '.';
import { Color } from '../../colors';
import { Matrix, Matrix2, MatrixValues } from '../../matrix';
import { Vector } from '../../vectors';

class CanvasProps {
    //================================================================================================================
    // CanvasCompositing
    //================================================================================================================
    globalAlpha!: number;
    globalCompositeOperation!: string;
    //================================================================================================================
    // CanvasImageSmoothing
    //================================================================================================================
    imageSmoothingEnabled!: boolean;
    imageSmoothingQuality!: ImageSmoothingQuality;
    //================================================================================================================
    // CanvasFillStrokeStyles
    //================================================================================================================
    fillStyle!: Style;
    strokeStyle!: Style;
    //================================================================================================================
    // CanvasShadowStyles
    //================================================================================================================
    shadowBlur!: number;
    shadowColor!: string;
    shadowOffsetX!: number;
    shadowOffsetY!: number;
    //================================================================================================================
    // CanvasFilters
    //================================================================================================================
    // filter: string; //* Proposal.
    //================================================================================================================
    // CanvasPathDrawingStyles
    //================================================================================================================
    lineCap!: CanvasLineCap;
    lineDashOffset!: number;
    lineJoin!: CanvasLineJoin;
    lineWidth!: number;
    miterLimit!: number;
    //================================================================================================================
    // CanvasTextDrawingStyles
    //================================================================================================================
    // direction: CanvasDirection;
    // font: string;
    // textAlign: CanvasTextAlign;
    // textBaseline: CanvasTextBaseline;

    //================================================================================================================
    //================================================================================================================
}

type PropsContainer = CanvasRenderingContext2D | CanvasProps | CanvasContext;

// TODO: Lazy update canvas transform.
export class CanvasContext {
    protected _matrix: Matrix;
    protected _props: CanvasProps;
    protected _originalProps: CanvasProps;
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
        this._originalProps = new CanvasProps();
        this._props = new CanvasProps();
        this._propsStack = [];
        this.copyProps(this.ctx, this._originalProps);
        this.copyProps(this.ctx, this._props);
        this.updateCtxTransform();
    }

    readonly ctx: CanvasRenderingContext2D;

    pushProps() {
        const props = new CanvasProps();
        this.copyProps(this, props);
        this._propsStack.push(props);
        return this;
    }

    popProps() {
        const props = this._propsStack.pop();

        if (!props)
            throw new Error("Unbalanced properties pop.");

        this.copyProps(props, this);
        return this;
    }

    resetProps() {
        this.copyProps(this._originalProps, this);
        this._propsStack = [];
        return this;
    }

    reset() {
        this.resetProps();
        this.resetTransform();
        return this;
    }

    protected copyProps(source: PropsContainer, dest: PropsContainer) {
        dest.globalAlpha = source.globalAlpha;
        dest.globalCompositeOperation = source.globalCompositeOperation;
        dest.imageSmoothingEnabled = source.imageSmoothingEnabled;
        dest.imageSmoothingQuality = source.imageSmoothingQuality;
        dest.fillStyle = source.fillStyle;
        dest.strokeStyle = source.strokeStyle;
        dest.shadowBlur = source.shadowBlur;
        dest.shadowColor = source.shadowColor;
        dest.shadowOffsetX = source.shadowOffsetX;
        dest.shadowOffsetY = source.shadowOffsetY;
        dest.lineCap = source.lineCap;
        dest.lineDashOffset = source.lineDashOffset;
        dest.lineJoin = source.lineJoin;
        dest.lineWidth = source.lineWidth;
        dest.miterLimit = source.miterLimit;
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

    setTranslation(value: Vector): this;
    setTranslation(x: number, y: number): this;
    // @ts-ignore - unused param.
    setTranslation(param1: Vector | number, y?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.setTranslation(...arguments);
        return this.updateCtxTransform();
    }

    translate(value: Vector): this;
    translate(x: number, y: number): this;
    // @ts-ignore - unused param.
    translate(param1: Vector | number, y?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.translate(...arguments);
        return this.updateCtxTransform();
    }

    setRotation(radians: number): this {
        this._matrix.setRotation2D(radians);
        return this.updateCtxTransform();
    }

    setRotationDegrees(degrees: number): this {
        this._matrix.setRotationDegrees2D(degrees);
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

    setSkew(value: Vector): this;
    setSkew(radiansX: number, radiansY: number): this;
    // @ts-ignore - unused param.
    setSkew(param1: Vector | number, radiansY?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.setSkew(...arguments);
        return this.updateCtxTransform();
    }

    setSkewDegrees(value: Vector): this;
    setSkewDegrees(degreesX: number, degreesY: number): this;
    // @ts-ignore - unused param.
    setSkewDegrees(param1: Vector | number, degreesY?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.setSkewDegrees(...arguments);
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

    setScale(value: Vector): this;
    setScale(value: number): this;
    setScale(x: number, y: number): this;
    // @ts-ignore - unused param.
    setScale(param1: Vector | number, y?: number): this {
        // @ts-ignore - arguments length.
        this._matrix.setScale(...arguments);
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

    pushTransform(values?: MatrixValues) {
        this._matrix.push(values);
        return this;
    }

    popTransform() {
        this._matrix.pop();
        return this.updateCtxTransform();
    }

    pushThenIdentity() {
        this._matrix.pushThenIdentity();
        return this.updateCtxTransform();
    }

    pushThenSet(values: MatrixValues) {
        this._matrix.pushThenSet(values);
        return this.updateCtxTransform();
    }

    pushThenUpdate(values: MatrixValues) {
        this._matrix.pushThenMult(values);
        return this.updateCtxTransform();
    }

    setThenPush(values: MatrixValues) {
        this._matrix.setThenPush(values);
        return this.updateCtxTransform();
    }

    updateThenPush(values: MatrixValues) {
        this._matrix.multThenPush(values);
        return this.updateCtxTransform();
    }

    popUpdate() {
        this._matrix.popMultiply();
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
    get globalAlpha() { return this.ctx.globalAlpha; }
    set globalAlpha(value) { this.ctx.globalAlpha = value; }

    get globalCompositeOperation() { return <Compositions>this.ctx.globalCompositeOperation; }
    set globalCompositeOperation(value) { this.ctx.globalCompositeOperation = value; }
    //================================================================================================================
    // CanvasImageSmoothing
    //================================================================================================================
    get imageSmoothingEnabled() { return this.ctx.imageSmoothingEnabled; }
    set imageSmoothingEnabled(value) { this.ctx.imageSmoothingEnabled = value; }
    get imageSmoothingQuality() { return this.ctx.imageSmoothingQuality; }
    set imageSmoothingQuality(value) { this.ctx.imageSmoothingQuality = value; }
    //================================================================================================================
    // CanvasFillStrokeStyles
    //================================================================================================================
    get fillStyle(): Brush { return this.ctx.fillStyle; }
    set fillStyle(value) { this.ctx.fillStyle = value instanceof Color ? value.toString() : value; }
    get strokeStyle(): Brush { return this.ctx.strokeStyle; }
    set strokeStyle(value) { this.ctx.strokeStyle = value instanceof Color ? value.toString() : value; }
    // createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    // createPattern(image: CanvasImageSource, repetition: string): CanvasPattern | null;
    // createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    //================================================================================================================
    // CanvasShadowStyles
    //================================================================================================================
    get shadowBlur() { return this.ctx.shadowBlur; }
    set shadowBlur(value) { this.ctx.shadowBlur = value; }
    get shadowColor(): CanvasColor { return this.ctx.shadowColor; }
    set shadowColor(value) { this.ctx.shadowColor = value instanceof Color ? value.toString() : value; }
    get shadowOffsetX() { return this.ctx.shadowOffsetX; }
    set shadowOffsetX(value) { this.ctx.shadowOffsetX = value; }
    get shadowOffsetY() { return this.ctx.shadowOffsetY; }
    set shadowOffsetY(value) { this.ctx.shadowOffsetY = value; }
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
    get lineCap() { return this.ctx.lineCap; }
    set lineCap(value) { this.ctx.lineCap = value; }
    get lineDashOffset() { return this.ctx.lineDashOffset; }
    set lineDashOffset(value) { this.ctx.lineDashOffset = value; }
    get lineJoin() { return this.ctx.lineJoin; }
    set lineJoin(value) { this.ctx.lineJoin = value; }
    get lineWidth() { return this.ctx.lineWidth; }
    set lineWidth(value) { this.ctx.lineWidth = value; }
    get miterLimit() { return this.ctx.miterLimit; }
    set miterLimit(value) { this.ctx.miterLimit = value; }
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
