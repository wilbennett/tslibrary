export type TypedArray
  = Float32Array
  | Float64Array
  // | BigInt64Array
  // | BigUint64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Uint8ClampedArray;

export type NumberArray = number[] | TypedArray;

export interface BoundsLike {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function isTypedArray(obj: any): obj is TypedArray {
  return !!(obj.buffer instanceof ArrayBuffer && obj.BYTES_PER_ELEMENT);
  // return obj instanceof Float32Array
  //   || obj instanceof Float64Array
  //   || obj instanceof Int8Array
  //   || obj instanceof Int16Array
  //   || obj instanceof Int32Array
  //   || obj instanceof Uint8Array
  //   || obj instanceof Uint16Array
  //   || obj instanceof Uint32Array
  //   || obj instanceof Uint8ClampedArray;
}

export function isNumberArray(obj: any): obj is NumberArray {
  return Array.isArray(obj) || isTypedArray(obj);
}
