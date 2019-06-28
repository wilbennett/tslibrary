import { Brush, CanvasColor, Compositions, Style } from '.';
import { Color } from '../../colors';
import { MathEx } from '../../core';
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
    // filter: string; //* Experimental.
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
    font!: string;
    textAlign!: CanvasTextAlign;
    textBaseline!: CanvasTextBaseline;
    // direction: CanvasDirection; //* Experimental.
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
        dest.font = source.font;
        dest.textAlign = source.textAlign;
        dest.textBaseline = source.textBaseline;
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

    // getTransform(): DOMMatrix; //* Experimental.
    // setTransform(transform?: DOMMatrix2DInit): void; //* Experimental.

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

    createLinearGradient(startPoint: Vector, endPoint: Vector): CanvasGradient;
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    createLinearGradient(param1: Vector | number, param2: any, x1?: number, y1?: number): CanvasGradient {
        return param1 instanceof Vector
            ? this.ctx.createLinearGradient(param1.x, param1.y, param2.x, param2.y)
            : this.ctx.createLinearGradient(param1, param2, x1!, y1!);
    }

    createPattern(image: CanvasImageSource, repetition: string): CanvasPattern | null {
        return this.ctx.createPattern(image, repetition);
    }

    createRadialGradient(startCirclePos: Vector, startRadius: number, endCirclePos: Vector, endRadius: number): CanvasGradient;
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    createRadialGradient(param1: Vector | number, param2: number, param3: any, param4: number, y1?: number, r1?: number): CanvasGradient {
        return param1 instanceof Vector
            ? this.ctx.createRadialGradient(param1.x, param1.y, param2, param3.x, param3.y, param4)
            : this.ctx.createRadialGradient(param1, param2, param3, param4, y1!, r1!);
    }
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
    // filter: string; //* Experimental.
    //================================================================================================================
    // CanvasRect
    //================================================================================================================
    clearRect(position: Vector, size: Vector): this;
    clearRect(x: number, y: number, w: number, h: number): this;
    clearRect(param1: Vector | number, param2: any, w?: number, h?: number): this {
        if (param1 instanceof Vector)
            this.ctx.clearRect(param1.x, param1.y, param2.x, param2.y);
        else
            this.ctx.clearRect(param1, param2, w!, h!);

        return this;
    }

    fillRect(position: Vector, size: Vector): this;
    fillRect(x: number, y: number, w: number, h: number): this;
    fillRect(param1: Vector | number, param2: any, w?: number, h?: number): this {
        if (param1 instanceof Vector)
            this.ctx.fillRect(param1.x, param1.y, param2.x, param2.y);
        else
            this.ctx.fillRect(param1, param2, w!, h!);

        return this;
    }

    strokeRect(position: Vector, size: Vector): this;
    strokeRect(x: number, y: number, w: number, h: number): this;
    strokeRect(param1: Vector | number, param2: any, w?: number, h?: number): this {
        if (param1 instanceof Vector)
            this.ctx.strokeRect(param1.x, param1.y, param2.x, param2.y);
        else
            this.ctx.strokeRect(param1, param2, w!, h!);

        return this;
    }
    //================================================================================================================
    // CanvasDrawPath
    //================================================================================================================
    beginPath(): this {
        this.ctx.beginPath();
        return this;
    }

    clip(fillRule?: CanvasFillRule): this;
    // clip(path: Path2D, fillRule?: CanvasFillRule): this; //* Experimental.
    clip(param1?: any, fillRule?: CanvasFillRule): this {
        if (!param1)
            this.ctx.clip();
        // else if (!(param1 instanceof Path2D))
        //     this.ctx.clip(param1);
        else
            this.ctx.clip(param1, fillRule);

        return this;
    }

    fill(fillRule?: CanvasFillRule): this;
    // fill(path: Path2D, fillRule?: CanvasFillRule): this; //* Experimental.
    fill(param1?: any, fillRule?: CanvasFillRule): this {
        if (!param1)
            this.ctx.fill();
        // else if (!(param1 instanceof Path2D))
        //     this.ctx.fill(param1);
        else
            this.ctx.fill(param1, fillRule);

        return this;
    }

    isPointInPath(point: Vector, fillRule?: CanvasFillRule): boolean;
    isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
    // isPointInPath(path: Path2D, point: Vector, fillRule?: CanvasFillRule): boolean; //* Experimental.
    // isPointInPath(path: Path2D, x: number, y: number, fillRule?: CanvasFillRule): boolean; //* Experimental.
    // @ts-ignore - unused param.
    isPointInPath(param1: Vector | number, param2?: any, param3?: any, param4?: any): boolean {
        if (param1 instanceof Vector)
            return this.ctx.isPointInPath(param1.x, param1.y, param2);

        // if (typeof param1 === "number")
        return this.ctx.isPointInPath(param1, param2, param3);

        // if (param2 instanceof Vector)
        //     return this.ctx.isPointInPath(param1, param2.x, param2.y, param3);

        // return this.ctx.isPointInPath(param1, param2, param3, param4);
    }

    isPointInStroke(point: Vector): boolean;
    isPointInStroke(x: number, y: number): boolean;
    // isPointInStroke(path: Path2D, point: Vector): boolean; //* Experimental.
    // isPointInStroke(path: Path2D, x: number, y: number): boolean; //* Experimental.
    // @ts-ignore - unused param.
    isPointInStroke(param1: Vector | number, param2?: any, param3?: number): boolean {
        if (param1 instanceof Vector)
            return this.ctx.isPointInStroke(param1.x, param1.y);

        // if (typeof param1 === "number")
        return this.ctx.isPointInStroke(param1, param2);

        // if (param2 instanceof Vector)
        //     return this.ctx.isPointInStroke(param1, param2.x, param2.y);

        // return this.ctx.isPointInStroke(param1, param2, param3!);
    }

    stroke(): this;
    // stroke(path: Path2D): this; //* Experimental.
    stroke(path?: Path2D): this {
        if (!path)
            this.ctx.stroke();
        // else
        //     this.ctx.stroke(path);

        return this;
    }
    //================================================================================================================
    // CanvasUserInterface
    //================================================================================================================
    drawFocusIfNeeded(element: Element): this;
    drawFocusIfNeeded(path: Path2D, element: Element): this;
    // @ts-ignore - unused param.
    drawFocusIfNeeded(param1: any, element?: Element): this {
        // if (param1 instanceof Element)
        this.ctx.drawFocusIfNeeded(param1);
        // else
        //     this.ctx.drawFocusIfNeeded(param1, element!);

        return this;
    }

    // scrollPathIntoView(): void; //* Experimental.
    // scrollPathIntoView(path: Path2D): void; //* Experimental.
    //================================================================================================================
    // CanvasText
    //================================================================================================================
    fillText(text: string, position: Vector, maxWidth?: number): this;
    fillText(text: string, x: number, y: number, maxWidth?: number): this;
    fillText(text: string, param2: Vector | number, param3: number, maxWidth?: number): this {
        if (param2 instanceof Vector)
            this.ctx.fillText(text, param2.x, param2.y, param3);
        else
            this.ctx.fillText(text, param2, param3, maxWidth);

        return this;
    }

    measureText(text: string): TextMetrics { return this.ctx.measureText(text); }

    strokeText(text: string, position: Vector, maxWidth?: number): this;
    strokeText(text: string, x: number, y: number, maxWidth?: number): this;
    strokeText(text: string, param2: Vector | number, param3: number, maxWidth?: number): this {
        if (param2 instanceof Vector)
            this.ctx.strokeText(text, param2.x, param2.y, param3);
        else
            this.ctx.strokeText(text, param2, param3, maxWidth);

        return this;
    }
    //================================================================================================================
    // CanvasDrawImage
    //================================================================================================================
    drawImage(image: CanvasImageSource, destPosition: Vector): this;
    drawImage(image: CanvasImageSource, dx: number, dy: number): this;
    drawImage(image: CanvasImageSource, destPosition: Vector, destSize: Vector): this;
    drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): this;
    drawImage(image: CanvasImageSource, sourcePosition: Vector, sourceSize: Vector, destPosition: Vector, destSize: Vector): this;
    drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): this;
    drawImage(
        image: CanvasImageSource,
        param2: any,
        param3?: any,
        param4?: any,
        param5?: any,
        param6?: any,
        param7?: any,
        param8?: any,
        param9?: any): this {
        if (arguments.length === 2 && param2 instanceof Vector)
            this.ctx.drawImage(image, param2.x, param2.y);
        else if (arguments.length === 3 && typeof param2 === "number")
            this.ctx.drawImage(image, param2, param3);
        else if (arguments.length === 3 && param2 instanceof Vector)
            this.ctx.drawImage(image, param2.x, param2.y);
        else if (arguments.length === 5 && typeof param2 === "number")
            this.ctx.drawImage(image, param2, param3, param4, param5);
        else if (arguments.length === 5 && param2 instanceof Vector)
            this.ctx.drawImage(image, param2.x, param2.y, param3.x, param3.y, param4.x, param4.y, param5.x, param5.y);
        else
            this.ctx.drawImage(image, param2, param3, param4, param5, param6, param7, param8, param9);

        return this;
    }
    //================================================================================================================
    // CanvasImageData
    //================================================================================================================
    createImageData(size: Vector): ImageData;
    createImageData(sw: number, sh: number): ImageData;
    createImageData(imagedata: ImageData): ImageData;
    createImageData(param1: Vector | ImageData | number, sh?: number): ImageData {
        if (param1 instanceof Vector)
            return this.ctx.createImageData(param1.x, param1.y);

        if (typeof param1 === "number")
            return this.ctx.createImageData(param1, sh!);

        return this.ctx.createImageData(param1);
    }

    getImageData(sourcePosition: Vector, sourceSize: Vector): ImageData;
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    getImageData(param1: Vector | number, param2: any, sw?: number, sh?: number): ImageData {
        if (param1 instanceof Vector)
            return this.ctx.getImageData(param1.x, param1.y, param2.x, param2.y);

        return this.ctx.getImageData(param1, param2, sw!, sh!);
    }

    putImageData(imagedata: ImageData, destPosition: Vector): this;
    putImageData(imagedata: ImageData, dx: number, dy: number): this;
    putImageData(imagedata: ImageData, destPosition: Vector, dirtyPosition: Vector, dirtySize: Vector): this;
    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): this;
    putImageData(
        imagedata: ImageData,
        param2: Vector | number,
        param3?: any,
        param4?: any,
        param5?: any,
        param6?: any,
        param7?: any): this {
        if (arguments.length == 2 && param2 instanceof Vector)
            this.ctx.putImageData(imagedata, param2.x, param2.y);
        else if (arguments.length == 3 && typeof param2 === "number")
            this.ctx.putImageData(imagedata, param2, param3);
        else if (param2 instanceof Vector)
            this.ctx.putImageData(imagedata, param2.x, param2.y, param3.x, param3.y, param4.x, param4.y);
        else
            this.ctx.putImageData(imagedata, param2, param3, param4, param5, param6, param7);

        return this;
    }
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

    getLineDash(): number[] { return this.ctx.getLineDash(); }

    setLineDash(segments: number[]): this {
        this.ctx.setLineDash(segments);
        return this;
    }
    //================================================================================================================
    // CanvasTextDrawingStyles
    //================================================================================================================
    get font() { return this.ctx.font; }
    set font(value) { this.ctx.font = value; }
    get textAlign() { return this.ctx.textAlign; }
    set textAlign(value) { this.ctx.textAlign = value; }
    get textBaseline() { return this.ctx.textBaseline; }
    set textBaseline(value) { this.ctx.textBaseline = value; }
    // direction: CanvasDirection; //* Experimental.
    //================================================================================================================
    // CanvasPath
    //================================================================================================================
    arc(center: Vector, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): this;
    arc(center: Vector, radius: number, anticlockwise?: boolean): this;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): this;
    arc(x: number, y: number, radius: number, anticlockwise?: boolean): this;
    arc(
        param1: Vector | number,
        param2: number,
        param3?: any,
        param4?: any,
        param5?: any,
        param6?: any): this {
        if (arguments.length >= 4 && param1 instanceof Vector)
            this.ctx.arc(param1.x, param1.y, param2, param3, param4, param5);
        else if (param1 instanceof Vector)
            this.ctx.arc(param1.x, param1.y, param2, 0, MathEx.TWO_PI, param3);
        else if (arguments.length >= 5)
            this.ctx.arc(param1, param2, param3, param4, param5, param6);
        else
            this.ctx.arc(param1, param2, param3, 0, MathEx.TWO_PI, param4);

        return this;
    }

    arcTo(controlPoint1: Vector, controlPoint2: Vector, radius: number): this;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this;
    arcTo(param1: Vector | number, param2: any, param3: number, y2?: number, radius?: number): this {
        if (param1 instanceof Vector)
            this.ctx.arcTo(param1.x, param1.y, param2.x, param2.y, param3);
        else
            this.ctx.arcTo(param1, param2, param3, y2!, radius!);

        return this;
    }

    bezierCurveTo(controlPoint1: Vector, controlPoint2: Vector, endPoint: Vector): this;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
    bezierCurveTo(param1: Vector | number, param2: any, param3: any, cp2y?: number, x?: number, y?: number): this {
        if (param1 instanceof Vector)
            this.ctx.bezierCurveTo(param1.x, param1.y, param2.x, param2.y, param3.x, param3.y);
        else
            this.ctx.bezierCurveTo(param1, param2, param3, cp2y!, x!, y!);

        return this;
    }

    closePath(): this {
        this.ctx.closePath();
        return this;
    }

    ellipse(center: Vector, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): this;
    ellipse(center: Vector, radius: Vector, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): this;
    ellipse(center: Vector, radiusX: number, radiusY: number, rotation?: number, anticlockwise?: boolean): this;
    ellipse(center: Vector, radius: Vector, rotation?: number, anticlockwise?: boolean): this;
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): this;
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation?: number, anticlockwise?: boolean): this;
    ellipse(
        param1: any,
        param2: any,
        param3: any,
        param4?: any,
        param5?: any,
        param6?: any,
        param7?: any,
        param8?: boolean): this {
        if (arguments.length >= 6 && param1 instanceof Vector)
            this.ctx.ellipse(param1.x, param1.y, param2, param3, param4, param5, param6, param7);
        else if (arguments.length >= 5 && param1 instanceof Vector)
            this.ctx.ellipse(param1.x, param1.y, param2.x, param2.y, param3, param4, param5, param6);
        else if (arguments.length >= 4 && param1 instanceof Vector)
            this.ctx.ellipse(param1.x, param1.y, param2, param3, param4 || 0, 0, MathEx.TWO_PI, param7);
        else if (arguments.length >= 3 && param1 instanceof Vector)
            this.ctx.ellipse(param1.x, param1.y, param2.x, param2.y, param3 || 0, 0, MathEx.TWO_PI, param6);
        else if (arguments.length >= 7)
            this.ctx.ellipse(param1, param2, param3, param4, param5, param6, param7, param8);
        else
            this.ctx.ellipse(param1, param2, param3, param4, param5 || 0, 0, MathEx.TWO_PI, param6);

        return this;
    }

    lineTo(point: Vector): this;
    lineTo(x: number, y: number): this;
    lineTo(param1: Vector | number, y?: number): this {
        if (param1 instanceof Vector)
            this.ctx.lineTo(param1.x, param1.y);
        else
            this.ctx.lineTo(param1, y!);

        return this;
    }

    moveTo(point: Vector): this;
    moveTo(x: number, y: number): this;
    moveTo(param1: Vector | number, y?: number): this {
        if (param1 instanceof Vector)
            this.ctx.moveTo(param1.x, param1.y);
        else
            this.ctx.moveTo(param1, y!);

        return this;
    }
    quadraticCurveTo(controlPoint: Vector, endPoint: Vector): this;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this;
    quadraticCurveTo(param1: Vector | number, param2: any, x?: number, y?: number): this {
        if (param1 instanceof Vector)
            this.ctx.quadraticCurveTo(param1.x, param1.y, param2.x, param2.y);
        else
            this.ctx.quadraticCurveTo(param1, param2, x!, y!);

        return this;
    }
    rect(position: Vector, size: Vector): this;
    rect(x: number, y: number, w: number, h: number): this;
    rect(param1: Vector | number, param2: any, w?: number, h?: number): this {
        if (param1 instanceof Vector)
            this.ctx.rect(param1.x, param1.y, param2.x, param2.y);
        else
            this.ctx.rect(param1, param2, w!, h!);

        return this;
    }
}
