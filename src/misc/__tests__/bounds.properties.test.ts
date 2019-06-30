import { Vector, Vector2, Vector2D, Vector3 } from '../../vectors';
import { Bounds } from '../bounds';

describe.each([
    ["2D", Vector2.createPosition(10, 20), Vector2.createDirection(20, 40)],
    ["3D", Vector3.createPosition(10, 20, 40), Vector3.createDirection(20, 40, 60)]
])("Should have the correct property values in %s", (_, pos, sz) => {
    const position = <Vector>pos;
    const size = <Vector>sz;

    it("Should return a zero bounds", () => {
        const bounds = Bounds.zero;

        expect(Vector2D.zeroPosition.equals(bounds.position)).toBeTruthy();
        expect(Vector2D.zeroDirection.equals(bounds.size)).toBeTruthy();
    });

    it("Should have the correct property values in the up direction", () => {
        let bounds = new Bounds(position, size, "up");
        const expected_halfSize = size.scaleN(0.5);
        const expected_max = position.displaceByN(size);
        const expected_topLeft = position.displaceByN(size.withXN(0).withZ(0));
        const expected_topRight = position.displaceByN(size.withZN(0));
        const expected_bottomRight = position.displaceByN(size.withYN(0).withZ(0));
        const expected_bottomLeft = position;
        const expected_center = position.displaceByN(expected_halfSize);
        const expected_left = expected_topLeft.x;
        const expected_right = expected_topRight.x;
        const expected_top = expected_topLeft.y;
        const expected_bottom = expected_bottomLeft.y;

        expected_topLeft.toString();//?
        bounds.topLeft.toString();//?
        expect(expected_halfSize.equals(bounds.halfSize)).toBeTruthy();
        expect(expected_max.equals(bounds.max)).toBeTruthy();
        expect(expected_topLeft.equals(bounds.topLeft)).toBeTruthy();
        expect(expected_topRight.equals(bounds.topRight)).toBeTruthy();
        expect(expected_bottomRight.equals(bounds.bottomRight)).toBeTruthy();
        expect(expected_bottomLeft.equals(bounds.bottomLeft)).toBeTruthy();
        expect(expected_center.equals(bounds.center)).toBeTruthy();
        expect(bounds.x).toBe(position.x);
        expect(bounds.y).toBe(position.y);
        expect(bounds.z).toBe(position.z);
        expect(bounds.width).toBe(size.x);
        expect(bounds.height).toBe(size.y);
        expect(bounds.depth).toBe(size.z);
        expect(bounds.w).toBe(size.x);
        expect(bounds.h).toBe(size.y);
        expect(bounds.d).toBe(size.z);
        expect(bounds.left).toBe(expected_left);
        expect(bounds.right).toBe(expected_right);
        expect(bounds.top).toBe(expected_top);
        expect(bounds.bottom).toBe(expected_bottom);
        expect(bounds.centerX).toBe(expected_center.x);
        expect(bounds.centerY).toBe(expected_center.y);
    });

    it("Should have the correct property values in the down direction", () => {
        let bounds = new Bounds(position, size, "down");

        const expected_halfSize = size.scaleN(0.5);
        const expected_max = position.displaceByN(size);
        const expected_topLeft = position;
        const expected_topRight = position.displaceByN(size.withYN(0).withZ(0));
        const expected_bottomRight = position.displaceByN(size.withZN(0));
        const expected_bottomLeft = position.displaceByN(size.withXN(0).withZ(0));
        const expected_center = position.displaceByN(expected_halfSize);
        const expected_left = expected_topLeft.x;
        const expected_right = expected_topRight.x;
        const expected_top = expected_topLeft.y;
        const expected_bottom = expected_bottomLeft.y;

        expect(expected_halfSize.equals(bounds.halfSize)).toBeTruthy();
        expect(expected_max.equals(bounds.max)).toBeTruthy();
        expect(expected_topLeft.equals(bounds.topLeft)).toBeTruthy();
        expect(expected_topRight.equals(bounds.topRight)).toBeTruthy();
        expect(expected_bottomRight.equals(bounds.bottomRight)).toBeTruthy();
        expect(expected_bottomLeft.equals(bounds.bottomLeft)).toBeTruthy();
        expect(expected_center.equals(bounds.center)).toBeTruthy();
        expect(bounds.x).toBe(position.x);
        expect(bounds.y).toBe(position.y);
        expect(bounds.z).toBe(position.z);
        expect(bounds.width).toBe(size.x);
        expect(bounds.height).toBe(size.y);
        expect(bounds.depth).toBe(size.z);
        expect(bounds.w).toBe(size.x);
        expect(bounds.h).toBe(size.y);
        expect(bounds.d).toBe(size.z);
        expect(bounds.left).toBe(expected_left);
        expect(bounds.right).toBe(expected_right);
        expect(bounds.top).toBe(expected_top);
        expect(bounds.bottom).toBe(expected_bottom);
        expect(bounds.centerX).toBe(expected_center.x);
        expect(bounds.centerY).toBe(expected_center.y);
    });
});
