import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Bounds } from '../../../misc';
import { PVector2, Vector, Vector2, Vector2Collection } from '../../../vectors';
import { CanvasRenderingContext2D } from '../__mocks__/canvas-rendering-context2d';
import { ImageData } from '../__mocks__/image-data';
import { CanvasContext } from '../canvas-context';

let shouldReturnNullContext = false;

// @ts-ignore - unused param.
HTMLCanvasElement.prototype.getContext = function (contextId: "2d", ...rest: any[]) {
    if (shouldReturnNullContext) {
        shouldReturnNullContext = false;
        return null;
    }

    return new CanvasRenderingContext2D(this);
}

test("Create with context", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    expect(() => { new CanvasContext(ctx!) }).not.toThrow();
});

it("Should throw error when canvas context is null", () => {
    shouldReturnNullContext = true;
    const canvas = document.createElement("canvas");

    expect(() => { new CanvasContext(canvas) }).toThrow();
});

let context: CanvasContext;
let ctx: CanvasRenderingContext2D;

type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
// TODO: Jest CLI doesn't find emit when running standalone.
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type cp = NonFunctionPropertyNames<Omit<CanvasRenderingContext2D, "canvas" | "transformation">>;
type ContextProps = Partial<Pick<CanvasRenderingContext2D, cp>>;

function getProperties() {
    const result: ContextProps = {};

    for (const propName of Object.getOwnPropertyNames(ctx)) {
        if (["canvas", "transformation"].find(x => x === propName)) continue;

        // @ts-ignore - indexer.
        result[propName] = context[propName];
    }

    return result;
}

beforeEach(() => {
    const canvas = document.createElement("canvas");
    context = new CanvasContext(canvas);
    // @ts-ignore - missing members.
    ctx = context.ctx;
});

describe("Should handle canvas transform operations", () => {
    it("Should be identity on creation", () => {
        const identity = context.createIdentity().toString();

        expect(ctx.transformation.toString()).toBe(identity);
        expect(context.getTransform(context.createValues()).toString()).toBe(identity);
        expect(context.getIdentity([]).toString()).toBe(identity);
        expect(context.inverse.toString()).toBe(identity);
        expect(context.getInverse([]).toString()).toBe(identity);
    });

    it("Should handle updating transform", () => {
        const identity = context.createIdentity().toString();
        const translate = [1, 0, 0, 1, 10, 20];
        const scale = [2, 0, 0, 4, 0, 0];
        const expected = "2,0,0,4,10,20";

        context.transform(translate);
        context.transform(scale);
        expect(ctx.transformation.toString()).toBe(expected);

        context.setToIdentity();
        expect(ctx.transformation.toString()).toBe(identity);
        context.transform(translate[0], translate[1], translate[2], translate[3], translate[4], translate[5]);
        context.transform(scale[0], scale[1], scale[2], scale[3], scale[4], scale[5]);
        expect(ctx.transformation.toString()).toBe(expected);
    });

    it("Should handle pushing and popping", () => {
        const identity = context.createIdentity().toString();
        const trans = [1, 0, 0, 1, 10, 20];
        const scale = [2, 0, 0, 4, 0, 0];
        const scaleTrans = [2, 0, 0, 4, 10, 20].toString();

        expect(() => context.popTransform()).toThrow();
        context.pushTransform();
        context.setTransform(trans);
        expect(ctx.transformation.toString()).toBe(trans.toString());
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(identity);
        expect(() => context.popTransform()).toThrow();

        context.setTransform(trans);
        context.pushTransform();
        context.setToIdentity();
        expect(ctx.transformation.toString()).toBe(identity);
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(trans.toString());

        context.setToIdentity();
        context.pushTransform(trans);
        expect(ctx.transformation.toString()).toBe(identity);
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(trans.toString());

        context.setTransform(trans);
        context.pushTransform();
        context.resetTransform();
        expect(() => context.popTransform()).toThrow();

        context.setTransform(trans);
        context.pushThenIdentity();
        expect(ctx.transformation.toString()).toBe(identity);
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(trans.toString());

        context.setToIdentity();
        context.setTransform(trans);
        context.pushTransform();
        context.setTransform(scale);
        context.pushTransform();
        expect(ctx.transformation.toString()).toBe(scale.toString());
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(scale.toString());
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(trans.toString());
        expect(() => context.popTransform()).toThrow();

        context.setToIdentity();
        context.setTransform(trans);
        context.pushThenSet(scale);
        expect(ctx.transformation.toString()).toBe(scale.toString());
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(trans.toString());

        context.setToIdentity();
        context.setTransform(trans);
        context.pushThenUpdate(scale);
        expect(ctx.transformation.toString()).toBe(scaleTrans.toString());
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(trans.toString());

        context.setToIdentity();
        context.setTransform(trans);
        context.setThenPush(scale);
        expect(ctx.transformation.toString()).toBe(scale.toString());
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(scale.toString());

        context.setToIdentity();
        context.setTransform(trans);
        context.updateThenPush(scale);
        expect(ctx.transformation.toString()).toBe(scaleTrans.toString());
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(scaleTrans.toString());

        context.setToIdentity();
        context.pushTransform(scale);
        context.pushTransform(trans);
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(trans.toString());
        context.popUpdate();
        expect(ctx.transformation.toString()).toBe(scaleTrans.toString());
    });

    it("should handle translation", () => {
        const original = new PVector2(1, 0);
        const trans = Vector2.create(10, 10);
        const expected = new PVector2(original.x + trans.x, original.y + trans.y);

        context.setTranslation(trans);
        let transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setTranslation(trans.x, trans.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.translate(trans);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.translate(trans.x, trans.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();
    });

    it("should handle rotation", () => {
        const original = new PVector2(1, 0);
        const angle = 90;
        const center = Vector2.create(10, 10);
        const expected = new PVector2(0, 1);
        const expectedCentered = new PVector2(20, 1);

        context.setRotation(MathEx.toRadians(angle));
        let transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setRotationDegrees(angle);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.rotate(MathEx.toRadians(angle));
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.rotate(MathEx.toRadians(angle), center);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expectedCentered)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.rotate(MathEx.toRadians(angle), center.x, center.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expectedCentered)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.rotateDegrees(angle);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.rotateDegrees(angle, center);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expectedCentered)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.rotateDegrees(angle, center.x, center.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expectedCentered)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();
    });

    it("should handle skewing", () => {
        const original = new PVector2(10, 10);
        const angle = Vector2.create(10, 20);
        const radians = new PVector2(MathEx.toRadians(angle.x), MathEx.toRadians(angle.y));
        const expected = new PVector2(11.76, 13.64);

        context.setSkew(radians);
        let transformed = context.transformPoint(original);
        expect(transformed.equals(expected, 0.01)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setSkew(radians.x, radians.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected, 0.01)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.setSkewDegrees(angle);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected, 0.01)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setSkewDegrees(angle.x, angle.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected, 0.01)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.skew(radians);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected, 0.01)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.skew(radians.x, radians.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected, 0.01)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.skewX(radians.x);
        transformed = context.transformPoint(original);
        expect(transformed.x).toBeCloseTo(expected.x);
        expect(transformed.y).toBe(original.y);
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.skewY(radians.y);
        transformed = context.transformPoint(original);
        expect(transformed.y).toBeCloseTo(expected.y);
        expect(transformed.x).toBe(original.x);
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.skewDegrees(angle);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected, 0.01)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.skewDegrees(angle.x, angle.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected, 0.01)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.skewXDegrees(angle.x);
        transformed = context.transformPoint(original);
        expect(transformed.x).toBeCloseTo(expected.x);
        expect(transformed.y).toBe(original.y);
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.skewYDegrees(angle.y);
        transformed = context.transformPoint(original);
        expect(transformed.y).toBeCloseTo(expected.y);
        expect(transformed.x).toBe(original.x);
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();
    });

    it("should handle scaling", () => {
        const original = new PVector2(1, 2);
        const scale = Vector2.create(2, 4);
        let expected = new PVector2(original.x * scale.x, original.y * scale.y);

        context.setScale(scale);
        let transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setScale(scale.x, scale.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.scale(scale);
        transformed = context.transformPoint(original);//? $.toString()
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.setToIdentity();
        context.scale(scale.x, scale.y);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        expected = new PVector2(original.x * scale.x, original.y * scale.x);
        context.setToIdentity();
        context.setScale(scale.x);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();

        context.scale(scale.x);
        transformed = context.transformPoint(original);
        expect(transformed.equals(expected)).toBeTruthy();
        expect(context.transformPointInverse(transformed).equals(original)).toBeTruthy();
    });
});

describe("Should handle pushing and popping", () => {
    it("Should handle pushing and popping properties", () => {
        const originalProps = getProperties();

        context.globalAlpha = 0.5;
        context.globalCompositeOperation = "source-in";
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.fillStyle = WebColors.red;
        context.fillStyle = "red";
        context.strokeStyle = WebColors.green;
        context.strokeStyle = "green";
        context.shadowBlur = 0.6;
        context.shadowColor = WebColors.blue;
        context.shadowColor = "blue";
        context.shadowOffsetX = 10;
        context.shadowOffsetY = 20;
        context.lineCap = "round";
        context.lineDashOffset = 2;
        context.lineJoin = "bevel";
        context.lineWidth = 3;
        context.miterLimit = 4;
        context.font = "20px Arial";
        context.textAlign = "center";
        context.textBaseline = "bottom";

        expect(() => context.popProps()).toThrow();
        context.pushProps();
        context.globalAlpha = 0.8;
        context.popProps();
        expect(getProperties()).toMatchSnapshot();
        expect(() => context.popProps()).toThrow();

        context.resetProps();
        expect(getProperties()).toMatchObject(originalProps);

        context
            .withGlobalAlpha(0.5)
            .withGlobalCompositeOperation("source-in")
            .withImageSmoothingEnabled(true)
            .withImageSmoothingQuality("high")
            .withFillStyle(WebColors.red)
            .withFillStyle("red")
            .withStrokeStyle(WebColors.green)
            .withStrokeStyle("green")
            .withShadowBlur(0.6)
            .withShadowColor(WebColors.blue)
            .withShadowColor("blue")
            .withShadowOffsetX(10)
            .withShadowOffsetY(20)
            .withLineCap("round")
            .withLineDashOffset(2)
            .withLineJoin("bevel")
            .withLineWidth(3)
            .withMiterLimit(4)
            .withFont("20px Arial")
            .withTextAlign("center")
            .withTextBaseline("bottom");

        context.pushProps();
        context.globalAlpha = 0.8;
        context.popProps();
        expect(getProperties()).toMatchSnapshot();
    });

    it("Should handle pushing and popping properties and transforms", () => {
        const originalProps = getProperties();
        const identity = context.createIdentity().toString();
        const initial = [1, 1, 1, 1, 1, 1];

        expect(() => context.restore()).toThrow();
        context.save();
        context.setTransform(initial[0], initial[1], initial[2], initial[3], initial[4], initial[5]);
        expect(ctx.transformation.toString()).toBe(initial.toString());
        context.restore();
        expect(getProperties()).toMatchObject(originalProps);
        expect(ctx.transformation.toString()).toBe(identity);
        expect(() => context.restore()).toThrow();

        context.setTransform(initial[0], initial[1], initial[2], initial[3], initial[4], initial[5]);
        context.reset();
        expect(getProperties()).toMatchObject(originalProps);
        expect(ctx.transformation.toString()).toBe(identity);
    });
});

describe("Should handle context properties", () => {
    it("Should handle setting properties", () => {
        const originalProps = getProperties();

        const props = {
            globalAlpha: 0.7,
            fillStyle: "orange",
            shadowBlur: 0.8
        };

        context.strokeStyle = "yellow";
        context.withProps(props);
        expect(getProperties()).toMatchSnapshot();
        expect(ctx.strokeStyle).toBe("yellow");
        context.withProps(props, true);
        expect(getProperties()).toMatchSnapshot();
        expect(ctx.strokeStyle).toBe(originalProps.strokeStyle);
    });
});

describe("Should handle context methods", () => {

    test("Fill stroke styles call signatures", () => {
        const start = Vector.create(1, 1);
        const end = Vector.create(2, 2);

        context.createLinearGradient(start, end);
        context.createLinearGradient(start.x, start.y, end.x, end.y);

        context.createPattern(new Image(), "");

        context.createRadialGradient(start, 1, end, 2);
        context.createRadialGradient(start.x, start.y, 3, end.x, end.y, 4);
    });

    test("Rect call signatures", () => {
        const position = Vector2.createPosition(1, 1);
        const size = Vector2.createDirection(2, 2);
        const bounds = new Bounds(position, size, "down");

        context.clearRect(position, size);
        context.clearRect(position.x, position.y, size.x, size.y);
        context.clearRect(bounds);

        context.fillRect(position, size);
        context.fillRect(position.x, position.y, size.x, size.y);
        context.fillRect(bounds);

        context.strokeRect(position, size);
        context.strokeRect(position.x, position.y, size.x, size.y);
        context.strokeRect(bounds);
    });

    test("Draw path call signatures", () => {
        const path = new Path2D();
        const point = Vector2.create(1, 1);

        context.beginPath();

        context.clip();
        context.clip("evenodd");
        context.clip(path);
        context.clip(path, "nonzero");

        context.fill();
        context.fill("nonzero");
        context.fill(path);
        context.fill(path, "evenodd");

        context.isPointInPath(point);
        context.isPointInPath(point, "evenodd");
        context.isPointInPath(point.x, point.y);
        context.isPointInPath(point.x, point.y, "nonzero");
        context.isPointInPath(path, point);
        context.isPointInPath(path, point, "evenodd");
        context.isPointInPath(path, point.x, point.y);
        context.isPointInPath(path, point.x, point.y, "nonzero");

        context.isPointInStroke(point);
        context.isPointInStroke(point.x, point.y);
        context.isPointInStroke(path, point);
        context.isPointInStroke(path, point.x, point.y);

        context.stroke();
        context.stroke(path);
    });

    test("User interface call signatures", () => {
        const path = new Path2D();

        context.drawFocusIfNeeded(document.createElement("element"));
        context.drawFocusIfNeeded(path, document.createElement("element"));
    });

    test("Text call signatures", () => {
        const position = Vector2.create(1, 1);

        context.fillText("1", position);
        context.fillText("2", position, 1);
        context.fillText("3", position.x, position.y);
        context.fillText("4", position.x, position.y, 2);

        context.measureText("5");

        context.strokeText("6", position);
        context.strokeText("7", position, 3);
        context.strokeText("8", position.x, position.y);
        context.strokeText("9", position.x, position.y, 4);
    });

    test("Draw image call signatures", () => {
        const image = new Image();
        const sourcePosition = Vector2.create(1, 1);
        const sourceSize = Vector2.create(2, 2);
        const destPosition = Vector2.create(3, 3);
        const destSize = Vector2.create(4, 4);
        const sourceBounds = new Bounds(sourcePosition, sourceSize);
        const destBounds = new Bounds(destPosition, destSize);

        context.drawImage(image, destPosition);
        context.drawImage(image, destPosition.x, destPosition.y);
        context.drawImage(image, destPosition, destSize);
        context.drawImage(image, destPosition.x, destPosition.y, destSize.x, destSize.y);
        context.drawImage(image, sourcePosition, sourceSize, destPosition, destSize);
        context.drawImage(image, sourcePosition.x, sourcePosition.y, sourceSize.x, sourceSize.y, destPosition.x, destPosition.y, destSize.x, destSize.y);
        context.drawImage(image, sourceBounds, destBounds);
        context.drawImage(image, destBounds);
    });

    test("Image data call signatures", () => {
        const imageData = new ImageData(1, 1);
        const sourcePosition = Vector2.create(1, 1);
        const sourceSize = Vector2.create(2, 2);
        const destPosition = Vector2.create(3, 3);
        const dirtyPosition = Vector2.create(5, 5);
        const dirtySize = Vector2.create(6, 6);
        const sourceBounds = new Bounds(sourcePosition, sourceSize);
        const dirtyBounds = new Bounds(dirtyPosition, dirtySize);

        context.createImageData(sourceSize);
        context.createImageData(imageData);
        context.createImageData(sourceSize.x, sourceSize.y);

        context.getImageData(sourcePosition, sourceSize);
        context.getImageData(sourcePosition.x, sourcePosition.y, sourceSize.x, sourceSize.y);
        context.getImageData(sourceBounds);

        context.putImageData(imageData, destPosition);
        context.putImageData(imageData, destPosition.x, destPosition.y);
        context.putImageData(imageData, destPosition, dirtyPosition, dirtySize);
        context.putImageData(imageData, destPosition.x, destPosition.y, dirtyPosition.x, dirtyPosition.y, dirtySize.x, dirtySize.y);
        context.putImageData(imageData, destPosition, dirtyBounds);
    });

    test("Path drawing styles call signatures", () => {
        context.getLineDash();
        context.setLineDash([1, 2]);
    });

    test("Path call signatures", () => {
        const twoPI = MathEx.TWO_PI;
        const center = Vector2.create(1, 1);
        const radius = Vector2.create(2, 2);
        const controlPoint1 = Vector2.create(3, 3);
        const controlPoint2 = Vector2.create(5, 5);
        const endPoint = Vector2.create(6, 6);
        const size = Vector2.create(7, 7);
        const bounds = new Bounds(controlPoint1, size);
        const points = [Vector2.create(0, 0), Vector2.create(10, 10), Vector2.create(20, 0)];
        const collection = new Vector2Collection(...points);

        context.arc(center, radius.x, 0, twoPI);
        context.arc(center, radius.x, 0, twoPI, true);
        context.arc(center, radius.x);
        context.arc(center, radius.x, false);
        context.arc(center.x, center.y, radius.x, 0, twoPI);
        context.arc(center.x, center.y, radius.x, 0, twoPI, true);
        context.arc(center.x, center.y, radius.x);
        context.arc(center.x, center.y, radius.x, false);

        context.arcTo(controlPoint1, controlPoint2, radius.x);
        context.arcTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, radius.x);

        context.bezierCurveTo(controlPoint1, controlPoint2, endPoint);
        context.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endPoint.x, endPoint.y);

        context.closePath();

        context.ellipse(center, radius.x, radius.y, 0, 0, twoPI);
        context.ellipse(center, radius.x, radius.y, 1, 0, twoPI, true);
        context.ellipse(center, radius, 2, 0, twoPI);
        context.ellipse(center, radius, 3, 0, twoPI, false);
        context.ellipse(center, radius.x, radius.y);
        context.ellipse(center, radius.x, radius.y, 4);
        context.ellipse(center, radius.x, radius.y, 5, true);
        context.ellipse(center, radius);
        context.ellipse(center, radius, 6);
        context.ellipse(center, radius, 7, false);
        context.ellipse(center.x, center.y, radius.x, radius.y, 8, 0, twoPI);
        context.ellipse(center.x, center.y, radius.x, radius.y, 9, 0, twoPI, true);
        context.ellipse(center.x, center.y, radius.x, radius.y);
        context.ellipse(center.x, center.y, radius.x, radius.y, 10);
        context.ellipse(center.x, center.y, radius.x, radius.y, 11, false);

        context.lineTo(endPoint);
        context.lineTo(endPoint.x, endPoint.y);

        context.moveTo(controlPoint1);
        context.moveTo(controlPoint1.x, controlPoint1.y);

        context.quadraticCurveTo(controlPoint1, endPoint);
        context.quadraticCurveTo(controlPoint1.x, controlPoint1.y, endPoint.x, endPoint.y);

        context.rect(controlPoint1, size);
        context.rect(controlPoint1.x, controlPoint1.y, size.x, size.y);
        context.rect(bounds);

        context.circle(center, radius.x);
        context.circle(center, radius.x, true);
        context.circle(center.x, center.y, radius.x);
        context.circle(center.x, center.y, radius.x, false);

        context.line(controlPoint1, endPoint);
        context.line(controlPoint1.x, controlPoint1.y, endPoint.x, endPoint.y);

        context.poly(points);
        context.poly(points, true);
        context.poly(collection);
        context.poly(collection, true);

        context.strokeCircle(center, radius.x);
        context.strokeCircle(center, radius.x, true);
        context.strokeCircle(center.x, center.y, radius.x);
        context.strokeCircle(center.x, center.y, radius.x, false);

        context.fillCircle(center, radius.x);
        context.fillCircle(center, radius.x, true);
        context.fillCircle(center.x, center.y, radius.x);
        context.fillCircle(center.x, center.y, radius.x, false);

        context.strokePoly(points);
        context.strokePoly(points, true);
        context.strokePoly(collection);
        context.strokePoly(collection, true);

        context.fillPoly(points);
        context.fillPoly(points, true);
        context.fillPoly(collection);
        context.fillPoly(collection, true);
    });
});
