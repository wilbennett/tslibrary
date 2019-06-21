import { Matrix, Matrix2, Matrix2D, MatrixValues } from '..';
import { MathEx } from '../../core';
import { Vector2D } from '../../vectors';

const DEFAULT_PREC = 3;

function prec(values: MatrixValues, amt: number) {
    const vals = Array.isArray(values) ? values : Array.from(values);
    return vals.map(v => v.toPrecision(amt)).join();
}

describe("Static Matrix2 members", () => {
    test("Construct new Matrix2", () => {
        expect(Matrix2.create()).toBeInstanceOf(Matrix2D);
    });

    test("Get Matrix2 global instance", () => {
        expect(Matrix2.instance).not.toBeNull();
        expect(Matrix2.instance).toBeInstanceOf(Matrix2D);
    });

    test("Set Matrix2 global instance", () => {
        const matrix = new Matrix2D();
        Matrix2.instance = matrix;
        expect(Matrix2.instance).toBe(matrix);
    });
});

describe.each([["Matrix2D", new Matrix2D()]])(
    "Matrix2 operations using %s",
    (_, mat) => {
        const matrix = <Matrix>mat;

        beforeEach(() => {
            matrix.reset();
        });

        it(`Should be identity on reset`, () => {
            const initial = [1, 1, 1, 1, 1, 1];
            const identity = matrix.createIdentity();
            matrix.set(initial);
            expect(matrix.values.toString()).toEqual(initial.toString());
            matrix.reset();
            expect(matrix.values.toString()).toEqual(identity.toString());
        });

        it("Should be identity when setToIdentity called", () => {
            const initial = [1, 1, 1, 1, 1, 1];
            const identity = matrix.getIdentity([]);
            matrix.set(initial)/*?.*/;
            expect(matrix.values.toString()).toEqual(initial.toString());
            matrix.setToIdentity()/*?.*/;
            expect(matrix.values.toString()).toEqual(identity.toString());
        });

        it("Should set translation", () => {
            matrix.setTranslation(new Vector2D(10, 20))/*?.*/;
            expect(matrix.values.toString()).toBe("1,0,0,1,10,20");
            matrix.setTranslation(30, 40)/*?.*/;
            expect(matrix.values.toString()).toBe("1,0,0,1,30,40");
        });

        it("Should set rotation", () => {
            const degrees = 10;
            const expected = "0.985,0.174,-0.174,0.985,0.00,0.00";

            matrix.setRotation2D(MathEx.toRadians(degrees));
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset();
            matrix.setRotationDegrees2D(degrees);
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);
        });

        it("Should set skew", () => {
            const degreesX = 10;
            const degreesY = 30;
            const expected = "1.00,0.577,0.176,1.00,0.00,0.00";

            matrix.setSkew(new Vector2D(MathEx.toRadians(degreesX), MathEx.toRadians(degreesY)))/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.setSkew(MathEx.toRadians(degreesX), MathEx.toRadians(degreesY))/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.setSkewDegrees(new Vector2D(degreesX, degreesY))/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.setSkewDegrees(degreesX, degreesY)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);
        });

        it("Should set scale", () => {
            matrix.setScale(new Vector2D(2, 3))/*?.*/;
            expect(matrix.values.toString()).toBe("2,0,0,3,0,0");
            matrix.setScale(4, 5)/*?.*/;
            expect(matrix.values.toString()).toBe("4,0,0,5,0,0");
            matrix.setScale(6)/*?.*/;
            expect(matrix.values.toString()).toBe("6,0,0,6,0,0");
        });

        it("Should apply transforms in the correct order", () => {
            matrix.setScale(0.5, 1.3)/*?.*/;
            matrix.setTranslation(150, 150)/*?.*/;
            matrix.setRotationDegrees2D(-45)/*?.*/;
            matrix.setSkewDegrees(10, 0)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe("0.354,-0.354,1.08,0.757,150,150");
        });

        it("Should do translation", () => {
            const vector = new Vector2D(10, 20);
            const expected = "1,0,0,1,10,20";
            matrix.translate(vector)/*?.*/;
            expect(matrix.values.toString()).toBe(expected);
            matrix.reset();
            matrix.translate(vector.x, vector.y)/*?.*/;
            expect(matrix.values.toString()).toBe(expected);
        });

        it("Should do rotation", () => {
            const degrees = 10;
            let expected = "0.985,0.174,-0.174,0.985,0.00,0.00";

            matrix.rotate2D(MathEx.toRadians(degrees))/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.rotateDegrees2D(degrees)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            const center = new Vector2D(10, 10);
            expected = "0.985,0.174,-0.174,0.985,1.89,-1.58";

            matrix.reset()/*?.*/;
            matrix.rotate2D(MathEx.toRadians(degrees), center)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.rotate2D(MathEx.toRadians(degrees), center.x, center.y)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.rotateDegrees2D(degrees, center)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.rotateDegrees2D(degrees, center.x, center.y)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);
        });

        it("Should do skew", () => {
            const degreesX = 10;
            const degreesY = 30;
            const expected = "1.00,0.577,0.176,1.00,0.00,0.00";

            matrix.skew(new Vector2D(MathEx.toRadians(degreesX), MathEx.toRadians(degreesY)))/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.skew(MathEx.toRadians(degreesX), MathEx.toRadians(degreesY))/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.skewDegrees(new Vector2D(degreesX, degreesY))/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.skewDegrees(degreesX, degreesY)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);
        });

        it("Should do x only skew", () => {
            const degrees = 10;
            const expected = "1.00,0.00,0.176,1.00,0.00,0.00";

            matrix.skewX(MathEx.toRadians(degrees))/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.skewXDegrees(degrees)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);
        });

        it("Should do y only skew", () => {
            const degrees = 10;
            const expected = "1.00,0.176,0.00,1.00,0.00,0.00";

            matrix.skewY(MathEx.toRadians(degrees))/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.skewYDegrees(degrees)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);
        });

        it("Should do scale", () => {
            const vector = new Vector2D(2, 3);
            const expected = "2,0,0,3,0,0";

            matrix.scale(vector)/*?.*/;
            expect(matrix.values.toString()).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.scale(vector.x, vector.y)/*?.*/;
            expect(matrix.values.toString()).toBe(expected);

            matrix.reset()/*?.*/;
            matrix.scale(vector.x)/*?.*/;
            expect(matrix.values.toString()).toBe("2,0,0,2,0,0");
        });

        it("Should combine transforms correctly", () => {
            matrix.translate(150, 150)/*?.*/;
            matrix.rotateDegrees2D(-45)/*?.*/;
            matrix.skewDegrees(10, 0)/*?.*/;
            matrix.scale(0.5, 1.3)/*?.*/;
            expect(prec(matrix.values, DEFAULT_PREC)).toBe("0.354,-0.354,1.08,0.757,150,150");
        });

        it("Should transform a vector", () => {
            const tx = 10;
            const ty = 20;
            const initial = new Vector2D(1, 0);
            const expected = new Vector2D(initial.x + tx, initial.y + ty).toString();

            matrix.translate(tx, ty)/*?.*/;
            expect(matrix.transform(initial).toString()).toBe(expected);
        });

        it("Should inverse transform a vector", () => {
            const tx = 10;
            const ty = 20;
            const initial = new Vector2D(1, 0);

            matrix.translate(tx, ty)/*?.*/;
            const transformed = matrix.transform(initial);
            expect(transformed.toString()).not.toBe(initial.toString());
            expect(matrix.transformInverse(transformed).toString()).toBe(initial.toString());
        });

        it("Should calculate inverse translation", () => {
            const tx = 10;
            const ty = 20;
            const initial = new Vector2D(1, 0);

            matrix.translate(tx, ty)/*?.*/;
            const transformed = matrix.transform(initial);
            expect(transformed.toString()).not.toBe(initial.toString());
            expect(matrix.transformInverse(transformed).toString()).toBe(initial.toString());
        });

        it("Should calculate inverse rotation", () => {
            const degrees = 10;
            const initial = new Vector2D(1, 0);

            matrix.rotateDegrees2D(degrees)/*?.*/;
            const transformed = matrix.transform(initial);
            expect(transformed.toString()).not.toBe(initial.toString());
            expect(matrix.transformInverse(transformed).toString()).toBe(initial.toString());
        });

        it("Should calculate inverse skew", () => {
            const kx = 10;
            const ky = 20;
            const initial = new Vector2D(1, 0);

            matrix.skew(kx, ky)/*?.*/;
            const transformed = matrix.transform(initial);
            expect(transformed.toString()).not.toBe(initial.toString());
            expect(matrix.transformInverse(transformed).toString()).toBe(initial.toString());
        });

        it("Should calculate inverse scale", () => {
            const sx = 10;
            const sy = 20;
            const initial = new Vector2D(1, 0);

            matrix.scale(sx, sy)/*?.*/;
            const transformed = matrix.transform(initial);
            expect(transformed.toString()).not.toBe(initial.toString());
            expect(matrix.transformInverse(transformed).toString()).toBe(initial.toString());
        });

        it("Should calculate inverse transformation", () => {
            const initial = new Vector2D(1, 0);

            matrix.setTranslation(150, 150)/*?.*/;
            matrix.setRotationDegrees2D(-45)/*?.*/;
            matrix.setSkewDegrees(10, 0)/*?.*/;
            matrix.setScale(0.5, 1.3)/*?.*/;
            expect(matrix.isInverseValid).toBeTruthy();
            let transformed = matrix.transform(initial);
            expect(transformed.toString()).not.toBe(initial.toString());
            expect(matrix.transformInverse(transformed).toString()).toBe(initial.toString());

            matrix.translate(150, 150)/*?.*/;
            matrix.rotateDegrees2D(-45)/*?.*/;
            matrix.skewDegrees(10, 0)/*?.*/;
            matrix.scale(0.5, 1.3)/*?.*/;
            transformed = matrix.transform(initial);
            expect(transformed.toString()).not.toBe(initial.toString());
            expect(matrix.transformInverse(transformed).toString()).toBe(initial.toString());
        });

        it("Should return false for isInverseValid when no valid inverse", () => {
            matrix.set([0, 0, 0, 0, 0, 0, 0])/*?.*/;
            expect(matrix.isInverseValid).toBeFalsy();
        });

        it("Should multiply two matricies", () => {
            const expected = [2, 0, 0, 3, 10, 20];
            matrix.setTranslation(10, 20);/*?.*/
            const translation = matrix.getValues([]);/*?.*/
            matrix.setScale(2, 3);/*?.*/
            const scale = matrix.getValues([]);
            matrix.mult(translation, scale);/*?.*/
            expect(matrix.values.toString()).toBe(expected.toString());
        });

        it("Should push and pop correctly", () => {
            matrix.setTranslation(10, 20);
            const expected = [1, 0, 0, 1, 10, 20];
            matrix.push();/*?.*/
            matrix.setToIdentity();/*?.*/
            matrix.pop();/*?.*/
            expect(matrix.values.toString()).toBe(expected.toString());
            expect(() => matrix.pop()).toThrow();
        });

        it("Should push and set to identity", () => {
            const initial = [1, 2, 3, 4, 5, 6];
            const identity = matrix.getIdentity([]);
            matrix.set(initial);
            matrix.pushThenIdentity();
            expect(matrix.values.toString()).toBe(identity.toString());
            matrix.pop();
            expect(matrix.values.toString()).toBe(initial.toString());
        });

        it("Should push and set values", () => {
            const initial = [1, 2, 3, 4, 5, 6];
            const second = [2, 4, 5, 6, 8, 10];
            matrix.set(initial);
            matrix.pushThenSet(second);
            expect(matrix.values.toString()).toBe(second.toString());
            matrix.pop();
            expect(matrix.values.toString()).toBe(initial.toString());
        });

        it("Should push and multiply", () => {
            const value = [1, 2, 3, 4, 5, 6];
            const identity = matrix.getIdentity([]);
            matrix.pushThenMult(value);
            expect(matrix.values.toString()).toBe(value.toString());
            matrix.pop();
            expect(matrix.values.toString()).toBe(identity.toString());
        });

        it("Should set values and push", () => {
            const initial = [1, 2, 3, 4, 5, 6];
            matrix.setThenPush(initial);
            expect(matrix.values.toString()).toBe(initial.toString());
            matrix.setToIdentity();
            matrix.pop();
            expect(matrix.values.toString()).toBe(initial.toString());
        });

        it("Should multiply and push", () => {
            const value = [1, 2, 3, 4, 5, 6];
            matrix.multThenPush(value);
            expect(matrix.values.toString()).toBe(value.toString());
            matrix.setToIdentity();
            matrix.pop();
            expect(matrix.values.toString()).toBe(value.toString());
        });
    }
);
