import { DataList, NumberArray } from '..';

function fillValues(values: NumberArray) {
  for (let i = 0; i < values.length; i++) {
    values[i] = i;
  }
}

describe("Should allow working with data list", () => {
  const elementCount = 3;
  const count1 = 2;
  const count2 = 1;

  function create1() { return new DataList(count1, elementCount); }
  function create2() { return new DataList(count2, elementCount); }
  function createArray1() { return new DataList(count1, elementCount, new Array<number>(count1 * elementCount)); }
  function createFloat32Array1() { return new DataList(count1, elementCount, new Float32Array(count1 * elementCount)); }
  function createFloat32Array2() { return new DataList(count2, elementCount, new Float32Array(count2 * elementCount)); }

  describe("Should allow creating instances", () => {
    it.each([
      ["count and element count", create1()],
      ["existing array", createArray1()],
      ["existing typed array", createFloat32Array1()],
    ])(
      "Should allow creating with %s",
      (_, l) => {
        const list = <DataList>l;

        expect(list.count).toBe(count1);
        expect(list.elementCount).toBe(elementCount);
        expect(list.values.length).toBe(count1 * elementCount);
      });
  });

  describe("Should allow cloning", () => {
    it.each([
      ["array values", create1()],
      ["typed array values", createFloat32Array1()]
    ])(
      "Should clone with %s",
      (_, l) => {
        const list = <DataList>l;

        fillValues(list.values);
        const clone = list.clone();

        expect(clone.constructor.name).toBe(list.constructor.name);
        expect(clone.values.constructor.name).toBe(list.values.constructor.name);
        expect(clone.count).toBe(list.count);
        expect(clone.elementCount).toBe(list.elementCount);
        expect(clone.values.length).toBe(list.values.length);
        expect(clone.values.toString()).toBe(list.values.toString());
      });
  });

  describe("Should allow copying values", () => {
    it.each([
      ["array to array", create1(), create1()],
      ["small array to large array", create2(), create1()],
      ["large array to small array", create1(), create2()],
      ["typed array to typed array", createFloat32Array1(), createFloat32Array1()],
      ["small typed array to large typed array", createFloat32Array2(), createFloat32Array1()],
      ["large typed array to small typed array", createFloat32Array1(), createFloat32Array2()]
    ])(
      "Should copy %s",
      (_, l1, l2) => {
        const list1 = <DataList>l1;
        const list2 = <DataList>l2;
        fillValues(list1.values);

        expect(list2.values.toString()).not.toBe(list1.values.toString());
        list2.copyFrom(list1);
        expect(list2.values.toString()).toMatchSnapshot();
      });
  });

  it("Should calculate start index", () => {
    const list = create1();

    expect(list.getStartIndex(0)).toBe(0);
    expect(list.getStartIndex(1)).toBe(elementCount);
    expect(list.getStartIndex(2)).toBe(elementCount * 2);
    expect(list.getStartIndex(3)).toBe(elementCount * 3);
  });
});
