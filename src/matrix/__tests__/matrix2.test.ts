import { Matrix2, Matrix2D } from '..';

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
