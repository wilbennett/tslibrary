import { CanvasRenderingContext2D } from '../__mocks__/canvas-rendering-context2d';
import { CanvasContext } from '../canvas-context';

// @ts-ignore - unused param.
HTMLCanvasElement.prototype.getContext = function (contextId: "2d", ...rest: any[]) {
    return new CanvasRenderingContext2D();
}

it("Should create a new instance", () => {
    const canvas = document.createElement("canvas");
    const context = new CanvasContext(canvas);
    context;
});
