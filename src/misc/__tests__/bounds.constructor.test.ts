import { Vector, Vector2, Vector3 } from '../../vectors';
import { Bounds } from '../bounds';

describe.each([
    ["2D", Vector2.createPosition(10, 20), Vector2.createDirection(20, 40)],
    ["3D", Vector3.createPosition(10, 20, 40), Vector3.createDirection(20, 40, 60)]
])("Should allow %s construction", (_, pos, sz) => {
    const position = <Vector>pos;
    const size = <Vector>sz;
    const halfSize = size.scaleN(0.5);
    const center = position.displaceByN(halfSize);

    it("Should construct with position and size vectors", () => {
        let bounds = new Bounds(position, size);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds(position, size, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds(position, size, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");
    });

    it("Should construct with 3D position and size", () => {
        let bounds = new Bounds(position.x, position.y, position.z, size.x, size.y, size.z);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds(position.x, position.y, position.z, size.x, size.y, size.z, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds(position.x, position.y, position.z, size.x, size.y, size.z, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");
    });

    it("Should construct with 2D position and size", () => {
        let bounds = new Bounds(position.x, position.y, size.x, size.y);
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds(position.x, position.y, size.x, size.y, "up");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds(position.x, position.y, size.x, size.y, "down");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("down");
    });

    it("Should construct from center with position and size vectors", () => {
        let bounds = new Bounds("center", center, size);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("center", center, size, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("center", center, size, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");

        bounds = Bounds.fromCenter(center, size);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenter(center, size, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenter(center, size, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");
    });

    it("Should construct from center with 3D position and size", () => {
        let bounds = new Bounds("center", center.x, center.y, center.z, size.x, size.y, size.z);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("center", center.x, center.y, center.z, size.x, size.y, size.z, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("center", center.x, center.y, center.z, size.x, size.y, size.z, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");

        bounds = Bounds.fromCenter(center.x, center.y, center.z, size.x, size.y, size.z);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenter(center.x, center.y, center.z, size.x, size.y, size.z, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenter(center.x, center.y, center.z, size.x, size.y, size.z, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");
    });

    it("Should construct from center with 2D position and size", () => {
        let bounds = new Bounds("center", center.x, center.y, size.x, size.y);
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("center", center.x, center.y, size.x, size.y, "up");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("center", center.x, center.y, size.x, size.y, "down");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("down");

        bounds = Bounds.fromCenter(center.x, center.y, size.x, size.y);
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenter(center.x, center.y, size.x, size.y, "up");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenter(center.x, center.y, size.x, size.y, "down");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("down");
    });

    it("Should construct from center with position and half size vectors", () => {
        let bounds = new Bounds("centerhalf", center, halfSize);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("centerhalf", center, halfSize, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("centerhalf", center, halfSize, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");

        bounds = Bounds.fromCenterHalf(center, halfSize);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenterHalf(center, halfSize, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenterHalf(center, halfSize, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");
    });

    it("Should construct from center with 3D position and half size", () => {
        let bounds = new Bounds("centerhalf", center.x, center.y, center.z, halfSize.x, halfSize.y, halfSize.z);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("centerhalf", center.x, center.y, center.z, halfSize.x, halfSize.y, halfSize.z, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("centerhalf", center.x, center.y, center.z, halfSize.x, halfSize.y, halfSize.z, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");

        bounds = Bounds.fromCenterHalf(center.x, center.y, center.z, halfSize.x, halfSize.y, halfSize.z);
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenterHalf(center.x, center.y, center.z, halfSize.x, halfSize.y, halfSize.z, "up");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenterHalf(center.x, center.y, center.z, halfSize.x, halfSize.y, halfSize.z, "down");
        expect(position.equals(bounds.position)).toBeTruthy();
        expect(size.equals(bounds.size)).toBeTruthy();
        expect(bounds.direction).toBe("down");
    });

    it("Should construct from center with 2D position and half size", () => {
        let bounds = new Bounds("centerhalf", center.x, center.y, halfSize.x, halfSize.y);
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("centerhalf", center.x, center.y, halfSize.x, halfSize.y, "up");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = new Bounds("centerhalf", center.x, center.y, halfSize.x, halfSize.y, "down");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("down");

        bounds = Bounds.fromCenterHalf(center.x, center.y, halfSize.x, halfSize.y);
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenterHalf(center.x, center.y, halfSize.x, halfSize.y, "up");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("up");

        bounds = Bounds.fromCenterHalf(center.x, center.y, halfSize.x, halfSize.y, "down");
        expect(bounds.position.equals(position)).toBeTruthy();
        expect(bounds.size.equals(size)).toBeTruthy();
        expect(bounds.direction).toBe("down");
    });
});
