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

test.only("Create with context", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    expect(() => { new CanvasContext(ctx!) }).not.toThrow();
});

it.only("Should throw error when canvas context is null", () => {
    shouldReturnNullContext = true;
    const canvas = document.createElement("canvas");

    expect(() => { new CanvasContext(canvas) }).toThrow();
});

let context: CanvasContext;
let ctx: CanvasRenderingContext2D;

beforeEach(() => {
    const canvas = document.createElement("canvas");
    context = new CanvasContext(canvas);
    // @ts-ignore - missing members.
    ctx = context.ctx;
});

describe.only("Should handle canvas transform operations", () => {
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
        const initial = [1, 1, 1, 1, 1, 1];

        expect(() => context.popTransform()).toThrow();
        context.pushTransform();
        context.setTransform(initial);
        expect(ctx.transformation.toString()).toBe(initial.toString());
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(identity);
        expect(() => context.popTransform()).toThrow();

        context.setTransform(initial);
        context.pushTransform();
        context.setToIdentity();
        expect(ctx.transformation.toString()).toBe(identity);
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(initial.toString());

        context.setTransform(initial);
        context.pushTransform();
        context.resetTransform();
        expect(() => context.popTransform()).toThrow();
    });
});

describe.only("Should handle pushing and popping", () => {
    it("Should handle pushing and popping properties", () => {
        expect(() => context.popProps()).toThrow();
        context.pushProps();
        context.popProps();
        expect(() => context.popProps()).toThrow();
    });

    it("Should handle pushing and popping properties and transforms", () => {
        const identity = context.createIdentity().toString();
        const initial = [1, 1, 1, 1, 1, 1];

        expect(() => context.restore()).toThrow();
        context.save();
        context.setTransform(initial[0], initial[1], initial[2], initial[3], initial[4], initial[5]);
        expect(ctx.transformation.toString()).toBe(initial.toString());
        context.restore();
        expect(ctx.transformation.toString()).toBe(identity);
        expect(() => context.restore()).toThrow();
    });
});
