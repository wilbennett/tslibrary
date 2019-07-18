import { MathEx } from '..';

describe("Math functions", () => {
    it("Should calculate standard deviation", () => {
        const values = [600, 470, 170, 430, 300];
        const expected = 147.32;

        expect(MathEx.stddev(values)).toBeCloseTo(expected);
    });
});
