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
        const translate = [1, 0, 0, 1, 10, 20];
        const scale = [2, 0, 0, 4, 0, 0];

        context.transform(translate);
        context.transform(scale);
        expect(ctx.transformation.toString()).toBe("2,0,0,4,10,20");
    });

    it("Should handle pushing and popping", () => {
        const identity = context.createIdentity().toString();
        const initial = [1, 1, 1, 1, 1, 1];

        context.pushTransform();
        context.setTransform(initial);
        expect(ctx.transformation.toString()).toBe(initial.toString());
        context.popTransform();
        expect(ctx.transformation.toString()).toBe(identity);
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

        context.save();
        context.setTransform(initial);
        expect(ctx.transformation.toString()).toBe(initial.toString());
        context.restore();
        expect(ctx.transformation.toString()).toBe(identity);
    });
});
