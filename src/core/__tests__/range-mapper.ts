import { RangeMapper } from '..';

describe("Map a range to another range", () => {
    it("Should map ranges", () => {
        const mapper = new RangeMapper(0, 5, 0, 10);

        expect(mapper.convert(-1)).toBe(-2);
        expect(mapper.convert(0)).toBe(0);
        expect(mapper.convert(1)).toBe(2);
        expect(mapper.convert(2)).toBe(4);
        expect(mapper.convert(3)).toBe(6);
        expect(mapper.convert(4)).toBe(8);
        expect(mapper.convert(5)).toBe(10);
        expect(mapper.convert(6)).toBe(12);

        mapper.min = 10;
        mapper.max = 20;
        mapper.newMin = 0;
        mapper.newMax = 5;

        expect(mapper.convert(8)).toBe(-1);
        expect(mapper.convert(10)).toBe(0);
        expect(mapper.convert(12)).toBe(1);
        expect(mapper.convert(14)).toBe(2);
        expect(mapper.convert(16)).toBe(3);
        expect(mapper.convert(18)).toBe(4);
        expect(mapper.convert(20)).toBe(5);
        expect(mapper.convert(22)).toBe(6);

        mapper.min = 10;
        mapper.max = 10;
        mapper.newMin = 0;
        mapper.newMax = 5;

        expect(mapper.convert(9)).toBe(0);
        expect(mapper.convert(10)).toBe(0);
        expect(mapper.convert(11)).toBe(0);
        expect(mapper.convert(12)).toBe(0);

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
