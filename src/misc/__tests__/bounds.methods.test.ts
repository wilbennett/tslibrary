import { Vector, Vector2, Vector3 } from '../../vectors';
import { Bounds } from '../bounds';

describe.each([
    ["2D", Vector2.createPosition(10, 20), Vector2.createDirection(20, 40)],
    ["3D", Vector3.createPosition(10, 20, 40), Vector3.createDirection(20, 40, 60)]
])("Should execute methods properly in %s", (_, pos, sz) => {
    const position = <Vector>pos;
    const size = <Vector>sz;
    // const is2D = position instanceof Vector2;
    const is3D = position instanceof Vector3;

    it("Should provide a toString implementation", () => {
        let bounds1 = new Bounds(position, size, "up");
        let bounds2 = Bounds.fromCenter(position.displaceByN(size.scaleN(0.5)), size, "up");
        let bounds3 = new Bounds(position, size, "down");
        let bounds4 = Bounds.fromCenter(position.displaceByN(size.scaleN(0.5)), size, "down");

        expect(bounds1.toString()).toBe(bounds2.toString());
        expect(bounds3.toString()).toBe(bounds4.toString());
    });

    describe("Should execute correctly in the up direction", () => {
        let bounds: Bounds;

        beforeEach(() => {
            bounds = new Bounds(position, size, "up");
        });

        it("Should allow replacing position", () => {
            const newPosition = position.displaceByN(size);

            let newBounds = bounds.withPosition(newPosition);
            expect(newBounds.position.equals(newPosition)).toBeTruthy();
            expect(newBounds.size.equals(size)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withPosition(newPosition.x, newPosition.y, newPosition.z);
            expect(newBounds.position.equals(newPosition)).toBeTruthy();
            expect(newBounds.size.equals(size)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withPosition(newPosition.x, newPosition.y);
            expect(newBounds.position.x).toBe(newPosition.x);
            expect(newBounds.position.y).toBe(newPosition.y);
            expect(newBounds.position.z).toBe(0);
            expect(newBounds.size.equals(size)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);
        });

        it("Should allow replacing size", () => {
            const newSize = size.scaleN(2);

            let newBounds = bounds.withSize(newSize);
            expect(newBounds.size.equals(newSize)).toBeTruthy();
            expect(newBounds.position.equals(position)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withSize(newSize.x, newSize.y, newSize.z);
            expect(newBounds.size.equals(newSize)).toBeTruthy();
            expect(newBounds.position.equals(position)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withSize(newSize.x, newSize.y);
            expect(newBounds.size.x).toBe(newSize.x);
            expect(newBounds.size.y).toBe(newSize.y);
            expect(newBounds.size.z).toBe(0);
            expect(newBounds.position.equals(position)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withSize(newSize.x);
            expect(newBounds.size.x).toBe(newSize.x);
            expect(newBounds.size.y).toBe(newSize.x);
            expect(newBounds.size.z).toBe(is3D ? newSize.x : 0);
            expect(newBounds.position.equals(position)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);
        });

        it("Should inflate size", () => {
            const inflateSize = size.withXYZN(2, 2, 2);
            const expected_inflateSize = size.addN(inflateSize.scaleN(2));
            const deflateSize = inflateSize.negateN();
            const expected_deflateSize = size.addN(deflateSize.scaleN(2));
            const overDeflateSize = inflateSize.withXN(size.x + 1).negate();
            const expected_overDeflateSize = size.addN(overDeflateSize.scaleN(2)).withX(0);

            let newBounds = bounds.inflate(inflateSize);
            expect(newBounds.size.equals(expected_inflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(inflateSize.x, inflateSize.y, inflateSize.z);
            expect(newBounds.size.equals(expected_inflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(inflateSize.x, inflateSize.y);
            expect(newBounds.size.x).toBe(expected_inflateSize.x);
            expect(newBounds.size.y).toBe(expected_inflateSize.y);
            expect(newBounds.size.z).toBe(bounds.size.z);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(inflateSize.x);
            expect(newBounds.size.x).toBe(bounds.size.x + inflateSize.x * 2);
            expect(newBounds.size.y).toBe(bounds.size.y + inflateSize.x * 2);
            expect(newBounds.size.z).toBe(is3D ? bounds.size.z + inflateSize.x * 2 : 0);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(deflateSize);
            expect(newBounds.size.equals(expected_deflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(deflateSize.x, deflateSize.y, deflateSize.z);
            expect(newBounds.size.equals(expected_deflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(deflateSize.x, deflateSize.y);
            expect(newBounds.size.x).toBe(expected_deflateSize.x);
            expect(newBounds.size.y).toBe(expected_deflateSize.y);
            expect(newBounds.size.z).toBe(bounds.size.z);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(deflateSize.x);
            expect(newBounds.size.x).toBe(bounds.size.x + deflateSize.x * 2);
            expect(newBounds.size.y).toBe(bounds.size.y + deflateSize.x * 2);
            expect(newBounds.size.z).toBe(is3D ? bounds.size.z + deflateSize.x * 2 : 0);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(overDeflateSize);
            expect(newBounds.size.equals(expected_overDeflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(overDeflateSize.x, overDeflateSize.y, overDeflateSize.z);
            expect(newBounds.size.equals(expected_overDeflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(overDeflateSize.x, overDeflateSize.y);
            expect(newBounds.size.x).toBe(expected_overDeflateSize.x);
            expect(newBounds.size.y).toBe(expected_overDeflateSize.y);
            expect(newBounds.size.z).toBe(bounds.size.z);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(overDeflateSize.x);
            expect(newBounds.size.x).toBeGreaterThanOrEqual(0);
            expect(newBounds.size.y).toBeGreaterThanOrEqual(0);
            expect(newBounds.size.z).toBeGreaterThanOrEqual(0);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);
        });

        it("Should calculate correct offsets", () => {
            const posOffset = 1;
            const negOffset = -posOffset;

            expect(bounds.leftOffsetIn(posOffset)).toBe(bounds.left + posOffset);
            expect(bounds.leftOffsetIn(negOffset)).toBe(bounds.left + negOffset);
            expect(bounds.leftOffsetOut(posOffset)).toBe(bounds.left - posOffset);
            expect(bounds.leftOffsetOut(negOffset)).toBe(bounds.left - negOffset);

            expect(bounds.rightOffsetIn(posOffset)).toBe(bounds.right - posOffset);
            expect(bounds.rightOffsetIn(negOffset)).toBe(bounds.right - negOffset);
            expect(bounds.rightOffsetOut(posOffset)).toBe(bounds.right + posOffset);
            expect(bounds.rightOffsetOut(negOffset)).toBe(bounds.right + negOffset);

            expect(bounds.topOffsetAbove(posOffset)).toBe(bounds.top + posOffset);
            expect(bounds.topOffsetAbove(negOffset)).toBe(bounds.top + negOffset);
            expect(bounds.topOffsetBelow(posOffset)).toBe(bounds.top - posOffset);
            expect(bounds.topOffsetBelow(negOffset)).toBe(bounds.top - negOffset);

            expect(bounds.bottomOffsetAbove(posOffset)).toBe(bounds.bottom + posOffset);
            expect(bounds.bottomOffsetAbove(negOffset)).toBe(bounds.bottom + negOffset);
            expect(bounds.bottomOffsetBelow(posOffset)).toBe(bounds.bottom - posOffset);
            expect(bounds.bottomOffsetBelow(negOffset)).toBe(bounds.bottom - negOffset);

            expect(bounds.offsetAbove(1, posOffset)).toBe(1 + posOffset);
            expect(bounds.offsetAbove(1, negOffset)).toBe(1 + negOffset);
            expect(bounds.offsetBelow(1, posOffset)).toBe(1 - posOffset);
            expect(bounds.offsetBelow(1, negOffset)).toBe(1 - negOffset);
        });

        it("Should calculate correct penetrations", () => {
            const amt = 2;

            expect(bounds.leftPenetration(bounds.left + amt)).toBe(amt);
            expect(bounds.leftPenetration(bounds.left - amt)).toBe(-amt);

            expect(bounds.rightPenetration(bounds.right + amt)).toBe(-amt);
            expect(bounds.rightPenetration(bounds.right - amt)).toBe(amt);

            expect(bounds.topPenetration(bounds.top + amt)).toBe(-amt);
            expect(bounds.topPenetration(bounds.top - amt)).toBe(amt);

            expect(bounds.bottomPenetration(bounds.bottom + amt)).toBe(amt);
            expect(bounds.bottomPenetration(bounds.bottom - amt)).toBe(-amt);
        });

        it("Should calculate relative direction", () => {
            expect(bounds.isAbove(2, 5)).toBeTruthy();
            expect(bounds.isAbove(-2, 2)).toBeTruthy();
            expect(bounds.isAbove(5, 2)).toBeFalsy();
            expect(bounds.isAbove(2, -2)).toBeFalsy();

            expect(bounds.isBelow(5, 2)).toBeTruthy();
            expect(bounds.isBelow(2, -2)).toBeTruthy();
            expect(bounds.isBelow(2, 5)).toBeFalsy();
            expect(bounds.isBelow(-2, 2)).toBeFalsy();
        });

        it("Should calculate containment", () => {
            expect(bounds.contains(bounds.center)).toBeTruthy();
            expect(bounds.contains(bounds.center.displaceByN(bounds.size))).not.toBeTruthy();
        });

        it("Should calculate intersection", () => {
            const intersecting = new Bounds(position.displaceByN(bounds.halfSize), size, bounds.direction);
            const displacement = size.withXYZN(size.x + 1, size.y + 1, size.z + 1);
            const nonIntersecting = new Bounds(position.displaceByN(displacement), size, bounds.direction);

            expect(bounds.intersectsWith(intersecting)).toBeTruthy();
            expect(bounds.intersectsWith(nonIntersecting)).not.toBeTruthy();
        });
    });

    describe("Should execute correctly in the down direction", () => {
        let bounds: Bounds;

        beforeEach(() => {
            bounds = new Bounds(position, size, "down");
        });

        it("Should allow replacing position", () => {
            const newPosition = position.displaceByN(size);

            let newBounds = bounds.withPosition(newPosition);
            expect(newBounds.position.equals(newPosition)).toBeTruthy();
            expect(newBounds.size.equals(size)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withPosition(newPosition.x, newPosition.y, newPosition.z);
            expect(newBounds.position.equals(newPosition)).toBeTruthy();
            expect(newBounds.size.equals(size)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withPosition(newPosition.x, newPosition.y);
            expect(newBounds.position.x).toBe(newPosition.x);
            expect(newBounds.position.y).toBe(newPosition.y);
            expect(newBounds.position.z).toBe(0);
            expect(newBounds.size.equals(size)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);
        });

        it("Should allow replacing size", () => {
            const newSize = size.scaleN(2);

            let newBounds = bounds.withSize(newSize);
            expect(newBounds.size.equals(newSize)).toBeTruthy();
            expect(newBounds.position.equals(position)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withSize(newSize.x, newSize.y, newSize.z);
            expect(newBounds.size.equals(newSize)).toBeTruthy();
            expect(newBounds.position.equals(position)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withSize(newSize.x, newSize.y);
            expect(newBounds.size.x).toBe(newSize.x);
            expect(newBounds.size.y).toBe(newSize.y);
            expect(newBounds.size.z).toBe(0);
            expect(newBounds.position.equals(position)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.withSize(newSize.x);
            expect(newBounds.size.x).toBe(newSize.x);
            expect(newBounds.size.y).toBe(newSize.x);
            expect(newBounds.size.z).toBe(is3D ? newSize.x : 0);
            expect(newBounds.position.equals(position)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);
        });

        it("Should inflate size", () => {
            const inflateSize = size.withXYZN(2, 2, 2);
            const expected_inflateSize = size.addN(inflateSize.scaleN(2));
            const deflateSize = inflateSize.negateN();
            const expected_deflateSize = size.addN(deflateSize.scaleN(2));
            const overDeflateSize = inflateSize.withXN(size.x + 1).negate();
            const expected_overDeflateSize = size.addN(overDeflateSize.scaleN(2)).withX(0);

            let newBounds = bounds.inflate(inflateSize);
            expect(newBounds.size.equals(expected_inflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(inflateSize.x, inflateSize.y, inflateSize.z);
            expect(newBounds.size.equals(expected_inflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(inflateSize.x, inflateSize.y);
            expect(newBounds.size.x).toBe(expected_inflateSize.x);
            expect(newBounds.size.y).toBe(expected_inflateSize.y);
            expect(newBounds.size.z).toBe(bounds.size.z);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(inflateSize.x);
            expect(newBounds.size.x).toBe(bounds.size.x + inflateSize.x * 2);
            expect(newBounds.size.y).toBe(bounds.size.y + inflateSize.x * 2);
            expect(newBounds.size.z).toBe(is3D ? bounds.size.z + inflateSize.x * 2 : 0);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(deflateSize);
            expect(newBounds.size.equals(expected_deflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(deflateSize.x, deflateSize.y, deflateSize.z);
            expect(newBounds.size.equals(expected_deflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(deflateSize.x, deflateSize.y);
            expect(newBounds.size.x).toBe(expected_deflateSize.x);
            expect(newBounds.size.y).toBe(expected_deflateSize.y);
            expect(newBounds.size.z).toBe(bounds.size.z);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(deflateSize.x);
            expect(newBounds.size.x).toBe(bounds.size.x + deflateSize.x * 2);
            expect(newBounds.size.y).toBe(bounds.size.y + deflateSize.x * 2);
            expect(newBounds.size.z).toBe(is3D ? bounds.size.z + deflateSize.x * 2 : 0);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(overDeflateSize);
            expect(newBounds.size.equals(expected_overDeflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(overDeflateSize.x, overDeflateSize.y, overDeflateSize.z);
            expect(newBounds.size.equals(expected_overDeflateSize)).toBeTruthy();
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(overDeflateSize.x, overDeflateSize.y);
            expect(newBounds.size.x).toBe(expected_overDeflateSize.x);
            expect(newBounds.size.y).toBe(expected_overDeflateSize.y);
            expect(newBounds.size.z).toBe(bounds.size.z);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);

            newBounds = bounds.inflate(overDeflateSize.x);
            expect(newBounds.size.x).toBeGreaterThanOrEqual(0);
            expect(newBounds.size.y).toBeGreaterThanOrEqual(0);
            expect(newBounds.size.z).toBeGreaterThanOrEqual(0);
            expect(newBounds.center.equals(bounds.center)).toBeTruthy();
            expect(newBounds.direction).toBe(bounds.direction);
        });

        it("Should calculate correct offsets", () => {
            const posOffset = 1;
            const negOffset = -posOffset;

            expect(bounds.leftOffsetIn(posOffset)).toBe(bounds.left + posOffset);
            expect(bounds.leftOffsetIn(negOffset)).toBe(bounds.left + negOffset);
            expect(bounds.leftOffsetOut(posOffset)).toBe(bounds.left - posOffset);
            expect(bounds.leftOffsetOut(negOffset)).toBe(bounds.left - negOffset);

            expect(bounds.rightOffsetIn(posOffset)).toBe(bounds.right - posOffset);
            expect(bounds.rightOffsetIn(negOffset)).toBe(bounds.right - negOffset);
            expect(bounds.rightOffsetOut(posOffset)).toBe(bounds.right + posOffset);
            expect(bounds.rightOffsetOut(negOffset)).toBe(bounds.right + negOffset);

            expect(bounds.topOffsetAbove(posOffset)).toBe(bounds.top - posOffset);
            expect(bounds.topOffsetAbove(negOffset)).toBe(bounds.top - negOffset);
            expect(bounds.topOffsetBelow(posOffset)).toBe(bounds.top + posOffset);
            expect(bounds.topOffsetBelow(negOffset)).toBe(bounds.top + negOffset);

            expect(bounds.bottomOffsetAbove(posOffset)).toBe(bounds.bottom - posOffset);
            expect(bounds.bottomOffsetAbove(negOffset)).toBe(bounds.bottom - negOffset);
            expect(bounds.bottomOffsetBelow(posOffset)).toBe(bounds.bottom + posOffset);
            expect(bounds.bottomOffsetBelow(negOffset)).toBe(bounds.bottom + negOffset);

            expect(bounds.offsetAbove(1, posOffset)).toBe(1 - posOffset);
            expect(bounds.offsetAbove(1, negOffset)).toBe(1 - negOffset);
            expect(bounds.offsetBelow(1, posOffset)).toBe(1 + posOffset);
            expect(bounds.offsetBelow(1, negOffset)).toBe(1 + negOffset);
        });

        it("Should calculate correct penetrations", () => {
            const amt = 2;

            expect(bounds.leftPenetration(bounds.left + amt)).toBe(amt);
            expect(bounds.leftPenetration(bounds.left - amt)).toBe(-amt);

            expect(bounds.rightPenetration(bounds.right + amt)).toBe(-amt);
            expect(bounds.rightPenetration(bounds.right - amt)).toBe(amt);

            expect(bounds.topPenetration(bounds.top + amt)).toBe(amt);
            expect(bounds.topPenetration(bounds.top - amt)).toBe(-amt);

            expect(bounds.bottomPenetration(bounds.bottom + amt)).toBe(-amt);
            expect(bounds.bottomPenetration(bounds.bottom - amt)).toBe(amt);
        });

        it("Should calculate relative direction", () => {
            expect(bounds.isAbove(5, 2)).toBeTruthy();
            expect(bounds.isAbove(2, -2)).toBeTruthy();
            expect(bounds.isAbove(2, 5)).toBeFalsy();
            expect(bounds.isAbove(-2, 2)).toBeFalsy();

            expect(bounds.isBelow(2, 5)).toBeTruthy();
            expect(bounds.isBelow(-2, 2)).toBeTruthy();
            expect(bounds.isBelow(5, 2)).toBeFalsy();
            expect(bounds.isBelow(2, -2)).toBeFalsy();
        });

        it("Should calculate containment", () => {
            expect(bounds.contains(bounds.center)).toBeTruthy();
            expect(bounds.contains(bounds.center.displaceByN(bounds.size))).not.toBeTruthy();
        });

        it("Should calculate intersection", () => {
            const intersecting = new Bounds(position.displaceByN(bounds.halfSize), size, bounds.direction);
            const displacement = size.withXYZN(size.x + 1, size.y + 1, size.z + 1);
            const nonIntersecting = new Bounds(position.displaceByN(displacement), size, bounds.direction);

            expect(bounds.intersectsWith(intersecting)).toBeTruthy();
            expect(bounds.intersectsWith(nonIntersecting)).not.toBeTruthy();
        });
    });
});
