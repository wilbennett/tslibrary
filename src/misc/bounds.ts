import { Vector, Vector2D, Vector3D } from '../vectors';

export type BoundsDirection = "up" | "down";

export class Bounds {
    constructor(position: Vector, size: Vector, direction?: BoundsDirection);
    constructor(x: number, y: number, z: number, width: number, height: number, depth: number, direction?: BoundsDirection);
    constructor(x: number, y: number, width: number, height: number, direction?: BoundsDirection);
    constructor(mode: "center", center: Vector, size: Vector, direction?: BoundsDirection);
    constructor(mode: "center", centerX: number, centerY: number, centerZ: number, width: number, height: number, depth: number, direction?: BoundsDirection);
    constructor(mode: "center", centerX: number, centerY: number, width: number, height: number, direction?: BoundsDirection);
    constructor(mode: "centerhalf", center: Vector, halfSize: Vector, direction?: BoundsDirection);
    constructor(mode: "centerhalf", centerX: number, centerY: number, centerZ: number, halfWidth: number, halfHeight: number, halfDepth: number, direction?: BoundsDirection);
    constructor(mode: "centerhalf", centerX: number, centerY: number, halfWidth: number, halfHeight: number, direction?: BoundsDirection);
    constructor(param1: Vector | number | string, param2: any, param3?: any, param4?: any, param5?: any, param6?: any, param7?: any, param8?: any) {
        this.center = Vector.empty;
        this.halfSize = Vector.empty;
        this.direction = "up";

        if (param1 instanceof Vector && param2 instanceof Vector) {
            const position = param1;
            this.halfSize = param2.scaleN(0.5);
            this.center = position.displaceByN(this.halfSize);
            this.direction = param3 || "up";
        } else if (typeof param1 === "number") {
            if (arguments.length >= 6) {
                const position = Vector3D.createPosition(param1, param2, param3);
                this.halfSize = Vector3D.createDirection(param4 * 0.5, param5 * 0.5, param6 * 0.5);
                this.center = position.displaceByN(this.halfSize);
                this.direction = param7 || "up";
            } else {
                const position = Vector2D.createPosition(param1, param2);
                this.halfSize = Vector2D.createDirection(param3 * 0.5, param4 * 0.5);
                this.center = position.displaceByN(this.halfSize);
                this.direction = param5 || "up";
            }
        } else if (typeof param1 === "string") { // center or centerhalf.
            if (param1 === "center") {
                if (param2 instanceof Vector && param3 instanceof Vector) {
                    this.halfSize = param3.scaleN(0.5);
                    this.center = param2;
                    this.direction = param4 || "up";
                } else if (typeof param2 === "number") {
                    if (arguments.length >= 7) {
                        this.halfSize = Vector3D.createDirection(param5 * 0.5, param6 * 0.5, param7 * 0.5);
                        this.direction = param8 || "up";
                        this.center = Vector3D.createPosition(param2, param3, param4);
                    } else {
                        this.halfSize = Vector2D.createDirection(param4 * 0.5, param5 * 0.5);
                        this.direction = param6 || "up";
                        this.center = Vector2D.createPosition(param2, param3);
                    }
                }
            } else { // centerhalf.
                if (param2 instanceof Vector && param3 instanceof Vector) {
                    this.center = param2;
                    this.halfSize = param3;
                    this.direction = param4 || "up";
                } else if (typeof param2 === "number") {
                    if (arguments.length >= 7) {
                        this.center = Vector3D.createPosition(param2, param3, param4);
                        this.halfSize = Vector3D.createDirection(param5, param6, param7);
                        this.direction = param8 || "up";
                    } else {
                        this.center = Vector2D.createPosition(param2, param3);
                        this.halfSize = Vector2D.createDirection(param4, param5);
                        this.direction = param6 || "up";
                    }
                }
            }
        }
    }

    public center: Vector;
    public halfSize: Vector;
    public readonly direction: BoundsDirection;
    get x() { return this.position.x; }
    get y() { return this.position.y; }
    get z() { return this.position.z; }
    get width() { return this.size.x; }
    get height() { return this.size.y; }
    get depth() { return this.size.z; }
    get w() { return this.size.x; }
    get h() { return this.size.y; }
    get d() { return this.size.z; }
    get position() { return this.center.subN(this.halfSize); }
    get size() { return this.halfSize.scaleN(2); }
    get max() { return this.center.addN(this.halfSize); }
    get left() { return this.center.x - this.halfSize.x; }
    get right() { return this.center.x + this.halfSize.x; }
    get top() { return this.direction === "up" ? this.center.y + this.halfSize.y : this.center.y - this.halfSize.y; }
    get bottom() { return this.direction === "up" ? this.center.y - this.halfSize.y : this.center.y + this.halfSize.y; }
    get topLeft() { return this.center.withXYZWN(this.left, this.top, this.center.z - this.halfSize.z, 1); }
    get bottomLeft() { return this.center.withXYZWN(this.left, this.bottom, this.center.z - this.halfSize.z, 1); }
    get topRight() { return this.center.withXYZWN(this.right, this.top, this.center.z - this.halfSize.z, 1); }
    get bottomRight() { return this.center.withXYZWN(this.right, this.bottom, this.center.z - this.halfSize.z, 1); }

    get centerX() { return this.center.x; }
    get centerY() { return this.center.y; }

    toString() { return `(${this.position}, ${this.max})`; }

    withPosition(position: Vector): Bounds;
    withPosition(x: number, y: number, z: number): Bounds;
    withPosition(x: number, y: number): Bounds;
    withPosition(param1: Vector | number, y?: number, z?: number): Bounds {
        let position = param1 instanceof Vector
            ? param1
            : this.position.withXYZN(param1, y!, z || 0);

        return new Bounds(position, this.size, this.direction);
    }

    withSize(size: Vector): Bounds;
    withSize(width: number, height: number, depth: number): Bounds;
    withSize(width: number, height: number): Bounds;
    withSize(size: number): Bounds;
    withSize(param1: Vector | number, h?: number, d?: number): Bounds {
        let size: Vector;

        if (param1 instanceof Vector) {
            size = param1;
        } else if (arguments.length >= 2) {
            size = this.size.withXYZN(param1, h!, d || 0);
        } else
            size = this.size.withXYZN(param1, param1, param1);

        return new Bounds(this.position, size, this.direction);
    }

    inflate(size: Vector): Bounds;
    inflate(dx: number, dy: number, dz: number): Bounds;
    inflate(dx: number, dy: number): Bounds;
    inflate(size: number): Bounds;
    inflate(param1: Vector | number, dy?: number, dz?: number): Bounds {
        let halfSize: Vector = this.halfSize.clone();

        if (param1 instanceof Vector)
            halfSize.displaceBy(param1);
        else if (arguments.length === 3)
            halfSize.displaceBy(new Vector3D(param1, dy!, dz));
        else if (arguments.length === 2)
            halfSize.displaceBy(new Vector2D(param1, dy!));
        else
            halfSize.displaceBy(new Vector3D(param1, param1, param1));

        halfSize.withXYZ(Math.max(halfSize.x, 0), Math.max(halfSize.y, 0), Math.max(halfSize.z, 0));
        return Bounds.fromCenterHalf(this.center, halfSize, this.direction);
    }

    leftOffsetIn(x: number) { return this.left + x; }
    leftOffsetOut(x: number) { return this.left - x; }
    rightOffsetIn(x: number) { return this.right - x; }
    rightOffsetOut(x: number) { return this.right + x; }
    topOffsetAbove(delta: number) { return this.direction === "up" ? this.top + delta : this.top - delta; }
    topOffsetBelow(delta: number) { return this.direction === "up" ? this.top - delta : this.top + delta; }
    bottomOffsetAbove(delta: number) { return this.direction === "up" ? this.bottom + delta : this.bottom - delta; }
    bottomOffsetBelow(delta: number) { return this.direction === "up" ? this.bottom - delta : this.bottom + delta; }
    offsetAbove(y: number, delta: number) { return this.direction === "up" ? y + delta : y - delta; }
    offsetBelow(y: number, delta: number) { return this.direction === "up" ? y - delta : y + delta; }

    leftPenetration(x: number) { return x - this.left; }
    rightPenetration(x: number) { return this.right - x; }
    topPenetration(y: number) { return this.direction === "up" ? this.top - y : y - this.top; }
    bottomPenetration(y: number) { return this.direction === "up" ? y - this.bottom : this.bottom - y; }
    isAbove(baseY: number, y: number) { return this.direction === "up" ? y > baseY : y < baseY; };
    isBelow(baseY: number, y: number) { return this.direction === "up" ? y < baseY : y > baseY; };

    contains(point: Vector) {
        const max = this.max;

        return point.x >= this.x
            && point.x <= max.x
            && point.y >= this.y
            && point.y <= max.y
            && point.z >= this.z
            && point.z <= max.z;
    }

    intersectsWith(other: Bounds) {
        const max = this.max;
        const otherMax = other.max;

        return this.x <= otherMax.x && max.x >= other.x
            && this.y <= otherMax.y && max.y >= other.y
            && this.z <= otherMax.z && max.z >= other.z;
    }

    private static _zero: Bounds;

    static get zero() {
        if (!this._zero)
            this._zero = new Bounds(Vector3D.zeroPosition, Vector3D.zeroDirection, "up");

        return this._zero;
    }

    static fromCenter(center: Vector, size: Vector, direction?: BoundsDirection): Bounds;
    static fromCenter(centerX: number, centerY: number, centerZ: number, width: number, height: number, depth: number, direction?: BoundsDirection): Bounds;
    static fromCenter(centerX: number, centerY: number, width: number, height: number, direction?: BoundsDirection): Bounds;
    // @ts-ignore - unused param.
    static fromCenter(param1: any, param2: any, param3?: any, param4?: any, param5?: any, param6?: any, param7?: any): Bounds {
        // @ts-ignore - arguments length.
        return new Bounds("center", ...arguments);
    }

    static fromCenterHalf(center: Vector, halfSize: Vector, direction?: BoundsDirection): Bounds;
    static fromCenterHalf(centerX: number, centerY: number, centerZ: number, halfWidth: number, halfHeight: number, halfDepth: number, direction?: BoundsDirection): Bounds;
    static fromCenterHalf(centerX: number, centerY: number, halfWidth: number, halfHeight: number, direction?: BoundsDirection): Bounds;
    // @ts-ignore - unused param.
    static fromCenterHalf(param1: any, param2: any, param3?: any, param4?: any, param5?: any, param6?: any, param7?: any): Bounds {
        // @ts-ignore - arguments length.
        return new Bounds("centerhalf", ...arguments);
    }
}
