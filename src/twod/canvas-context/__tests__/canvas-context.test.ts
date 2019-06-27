import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { PVector2, Vector2 } from '../../../vectors';
import { CanvasRenderingContext2D } from '../__mocks__/canvas-rendering-context2d';
import { CanvasContext } from '../canvas-context';

let shouldReturnNullContext = false;

// @ts-ignore - unused param.
HTMLCanvasElement.prototype.getContext = function (contextId: "2d", ...rest: any[]) {
    if (shouldReturnNullContext) {
        shouldReturnNullContext = false;
        return null;
    }

    return new CanvasRenderingContext2D();
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

type PropertyHashTable = ({ [index: string]: any; });

function getProperties() {
    const result = <PropertyHashTable>{};

    for (const propName of Object.getOwnPropertyNames(context.constructor.prototype)) {
        const desc = Object.getOwnPropertyDescriptor(context.constructor.prototype, propName);

        // if (propName.startsWith('_')) continue;
        if (!desc || !desc["get"]) continue;
        if (["ctx", "transformation", "inverse"].find(x => x === propName)) continue;

        // @ts-ignore
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

    test("Fill stroke styles call signatures", () => {
        const start = Vector2.create(1, 1);
        const end = Vector2.create(2, 2);

        context.createLinearGradient(start, end);
        context.createLinearGradient(start.x, start.y, end.x, end.y);

        context.createPattern(new Image(), "");

        context.createRadialGradient(start, 1, end, 2);
        context.createRadialGradient(start.x, start.y, 3, end.x, end.y, 4);
    });

    test("Rect call signatures", () => {
        const position = Vector2.create(1, 1);
        const size = Vector2.create(2, 2);

        context.clearRect(position, size);
        context.clearRect(position.x, position.y, size.x, size.y);

        context.fillRect(position, size);
        context.fillRect(position.x, position.y, size.x, size.y);

        context.strokeRect(position, size);
        context.strokeRect(position.x, position.y, size.x, size.y);
    });
});
