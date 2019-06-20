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
            const identity = matrix.getIdentity([]);
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

        it("Should set scale", () => {
            matrix.setScale(new Vector2D(2, 3))/*?.*/;
            expect(matrix.values.toString()).toBe("2,0,0,3,0,0");
            matrix.setScale(4, 5)/*?.*/;
            expect(matrix.values.toString()).toBe("4,0,0,5,0,0");
            matrix.setScale(6)/*?.*/;
            expect(matrix.values.toString()).toBe("6,0,0,6,0,0");
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

        it("Should set rotation", () => {
            const degrees = 10;
            const expected = "0.985,0.174,-0.174,0.985,0.00,0.00";

            matrix.setRotation2D(MathEx.toRadians(degrees));
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);

            matrix.reset();
            matrix.setRotationDegrees2D(degrees);
            expect(prec(matrix.values, DEFAULT_PREC)).toBe(expected);
        });

        it.todo("Should apply transforms in the correct order");
        it.todo("Should do translation");
        it.todo("Should do scale");
        it.todo("Should do skew");
        it.todo("Should do x only skew");
        it.todo("Should do y only skew");
        it.todo("Should do rotation");
        it.todo("Should combine transforms correctly");
        it.todo("Should calculate inverse translation");
        it.todo("Should calculate inverse scale");
        it.todo("Should calculate inverse skew");
        it.todo("Should calculate inverse rotation");
        it.todo("Should calculate inverse transformation");
        it.todo("Should transform a vector");
        it.todo("Should inverse transform a vector");
        it.todo("Should push and pop correctly");
        it.todo("Should push and set to identity");
        it.todo("Should push and set values");
        it.todo("Should push and multiply");
        it.todo("Should set values and push");
        it.todo("Should multiply and push");
    }
);
