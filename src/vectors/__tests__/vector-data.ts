import { VectorDataX, VectorDataXYW, VectorDataXYZW } from '..';
import { DataList } from '../../core';

describe("Should allow working with vector data", () => {
  const count = 2;

  function createX(): DataList { return new VectorDataX(count); }
  function createXYW(): DataList { return new VectorDataXYW(count); }
  function createXYZW(): DataList { return new VectorDataXYZW(count); }
  function createArrayX(): DataList { return new VectorDataX(count, new Array<number>(count)); }
  function createArrayXYW(): DataList { return new VectorDataXYW(count, new Array<number>(count * 3)); }
  function createArrayXYZW(): DataList { return new VectorDataXYZW(count, new Array<number>(count * 4)); }

  function createFloat32X(): DataList { return new VectorDataX(count, new Float32Array(count)); }
  function createFloat32XYW(): DataList { return new VectorDataXYW(count, new Float32Array(count * 3)); }
  function createFloat32XYZW(): DataList { return new VectorDataXYZW(count, new Float32Array(count * 4)); }

  describe("Should allow creating instances", () => {
    it.each([
      ["vector data X with count", createX()],
      ["vector data X with existing", createArrayX()],
      ["vector data XYW with count", createXYW()],
      ["vector data XYW with existing", createArrayXYW()],
      ["vector data XYZW with count", createXYZW()],
      ["vector data XYZW with existing", createArrayXYZW()],
      ["vector data X with typed array", createFloat32X()],
      ["vector data XYW with typed array", createFloat32XYW()],
      ["vector data XYZW with typed array", createFloat32XYZW()]
    ])(
      "Should allow creating %s",
      (_, l) => {
        const list = <DataList>l;

        expect(list.count).toBe(count);
        expect(list.elementCount).toMatchSnapshot();
        expect(list.values.length).toMatchSnapshot();
      });
  });

  describe("Should calculate start index", () => {
    it.each([
      ["vector data X with count", createX()],
      ["vector data X with existing", createArrayX()],
      ["vector data XYW with count", createXYW()],
      ["vector data XYW with existing", createArrayXYW()],
      ["vector data XYZW with count", createXYZW()],
      ["vector data XYZW with existing", createArrayXYZW()],
      ["vector data X with typed array", createFloat32X()],
      ["vector data XYW with typed array", createFloat32XYW()],
      ["vector data XYZW with typed array", createFloat32XYZW()]
    ])(
      "Should calculate for %s",
      (_, l) => {
        const list = <DataList>l;

        expect(list.getStartIndex(0)).toBe(0);
        expect(list.getStartIndex(1)).toMatchSnapshot();
        expect(list.getStartIndex(2)).toMatchSnapshot();
        expect(list.getStartIndex(3)).toMatchSnapshot();
      });
  });
});
