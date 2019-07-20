import { RangeMapper } from '..';

describe("Map a range to another range", () => {
    it("Should map ranges", () => {
        const mapper = new RangeMapper(0, 5, 0, 10);

        expect(mapper.convert(-1)).toBe(-2);
        expect(mapper.convertClamp(-1)).toBe(0);
        expect(mapper.convert(0)).toBe(0);
        expect(mapper.convert(1)).toBe(2);
        expect(mapper.convert(2)).toBe(4);
        expect(mapper.convert(3)).toBe(6);
        expect(mapper.convert(4)).toBe(8);
        expect(mapper.convert(5)).toBe(10);
        expect(mapper.convert(6)).toBe(12);
        expect(mapper.convertClamp(6)).toBe(10);

        expect(mapper.reverse(-2)).toBe(-1);
        expect(mapper.reverseClamp(-2)).toBe(0);
        expect(mapper.reverse(0)).toBe(0);
        expect(mapper.reverse(2)).toBe(1);
        expect(mapper.reverse(4)).toBe(2);
        expect(mapper.reverse(6)).toBe(3);
        expect(mapper.reverse(8)).toBe(4);
        expect(mapper.reverse(10)).toBe(5);
        expect(mapper.reverse(12)).toBe(6);
        expect(mapper.reverseClamp(12)).toBe(5);

        mapper.min = 10;
        mapper.max = 20;
        mapper.newMin = 0;
        mapper.newMax = 5;

        expect(mapper.reverse(-1.5)).toBe(7);
        expect(mapper.reverseAsInt(-1)).toBe(8);
        expect(mapper.reverseAsIntClamp(-1)).toBe(10);
        expect(mapper.reverse(-1)).toBe(8);
        expect(mapper.reverseClamp(-1)).toBe(10);
        expect(mapper.reverse(-0.5)).toBe(9);
        expect(mapper.reverseAsInt(0)).toBeCloseTo(10);
        expect(mapper.reverse(0)).toBe(10);
        expect(mapper.reverse(0.5)).toBe(11);
        expect(mapper.reverseAsInt(1)).toBe(12);
        expect(mapper.reverse(1)).toBe(12);
        expect(mapper.reverse(2)).toBe(14);
        expect(mapper.reverse(3)).toBe(16);
        expect(mapper.reverse(4)).toBe(18);
        expect(mapper.reverse(5)).toBe(20);
        expect(mapper.reverse(5.5)).toBe(21);
        expect(mapper.reverseAsInt(6)).toBe(22);
        expect(mapper.reverseAsIntClamp(5)).toBe(20);
        expect(mapper.reverse(6)).toBe(22);
        expect(mapper.reverseClamp(5)).toBe(20);

        expect(mapper.convert(7)).toBe(-1.5);
        expect(mapper.convertAsInt(7)).toBe(-1);
        expect(mapper.convertAsIntClamp(7)).toBe(0);
        expect(mapper.convert(8)).toBe(-1);
        expect(mapper.convertClamp(8)).toBe(0);
        expect(mapper.convert(9)).toBe(-0.5);
        expect(mapper.convertAsInt(9)).toBeCloseTo(0);
        expect(mapper.convert(10)).toBe(0);
        expect(mapper.convert(11)).toBe(0.5);
        expect(mapper.convertAsInt(11)).toBe(1);
        expect(mapper.convert(12)).toBe(1);
        expect(mapper.convert(14)).toBe(2);
        expect(mapper.convert(16)).toBe(3);
        expect(mapper.convert(18)).toBe(4);
        expect(mapper.convert(20)).toBe(5);
        expect(mapper.convert(21)).toBe(5.5);
        expect(mapper.convertAsInt(21)).toBe(6);
        expect(mapper.convertAsIntClamp(21)).toBe(5);
        expect(mapper.convert(22)).toBe(6);
        expect(mapper.convertClamp(22)).toBe(5);

        mapper.min = 10;
        mapper.max = 10;
        mapper.newMin = 0;
        mapper.newMax = 5;

        expect(mapper.convert(9)).toBe(0);
        expect(mapper.convert(10)).toBe(0);
        expect(mapper.convert(11)).toBe(0);
        expect(mapper.convert(12)).toBe(0);
        expect(mapper.convertClamp(12)).toBe(0);
        expect(mapper.convertAsInt(12)).toBe(0);
        expect(mapper.convertAsIntClamp(12)).toBe(0);

        expect(mapper.reverse(-1)).toBe(10);
        expect(mapper.reverse(0)).toBe(10);
        expect(mapper.reverse(1)).toBe(10);
        expect(mapper.reverse(5)).toBe(10);
        expect(mapper.reverse(6)).toBe(10);
        expect(mapper.reverseClamp(6)).toBe(10);
        expect(mapper.reverseAsInt(6)).toBe(10);
        expect(mapper.reverseAsIntClamp(6)).toBe(10);

        mapper.min = 10;
        mapper.max = 10;
        mapper.newMin = 30;
        mapper.newMax = 40;

        expect(mapper.convert(9)).toBe(30);
        expect(mapper.convert(10)).toBe(30);
        expect(mapper.convert(11)).toBe(30);
        expect(mapper.convert(12)).toBe(30);
    });
});
