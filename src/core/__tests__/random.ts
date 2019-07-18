import { MathEx } from '..';

// function roundTo(value: number, precision: number) {
//     //  const mult = Math.pow(10, precision);
//     //  return Math.round(value * mult) / mult;
//     // return +value.toFixed(precision);
//      return +(Math.round(+(value + "e+" + precision)) + "e-" + precision);
//     // const y = value + precision * 0.5;
//     // return y - (y % precision);
// }

function roundTo(precision: number) {
    const prec1 = "e+" + precision;
    const prec2 = "e-" + precision;

    return (value: number) => {
        const result = +(Math.round(+(value + prec1)) + prec2);
        return !isNaN(result) ? result : 0;
    }
}

function createRandomFloats(count: number, precision: number) {
    const round = roundTo(precision);
    const nums = new Array<number>(count);
    MathEx.getRandomValues(count, nums);
    return nums.map(x => round(x));
}

describe("Random number generation", () => {
    it("Should generate random numbers", () => {
        const expected_deviation = 0.3;
        let nums: number[];

        expect(MathEx.seed).toEqual(expect.any(Number));

        MathEx.randomize(1);
        nums = createRandomFloats(10000, 1);
        expect(MathEx.stddev(nums)).toBeLessThanOrEqual(expected_deviation);

        MathEx.randomize(-1);
        nums = createRandomFloats(10000, 1);
        expect(MathEx.stddev(nums)).toBeLessThanOrEqual(expected_deviation);
    });
});
