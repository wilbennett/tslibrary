import { copy } from '..';

it("should copy matrix values", () => {
    const source = [1, 2, 3, 4, 5];
    const sourceF32 = new Float32Array([2, 4, 6, 8, 10]);
    let dest = [0, 0, 0, 0, 0];
    const dest32 = new Float32Array(dest);

    expect(copy(source, dest)/*?.*/.toString()).toBe(source.toString());
    expect(copy(source, dest32)/*?.*/.toString()).toBe(source.toString());
    dest = [0, 0, 0, 0, 0];
    dest32.fill(0);
    expect(copy(sourceF32, dest)/*?.*/.toString()).toBe(sourceF32.toString());
    expect(copy(sourceF32, dest32)/*?.*/.toString()).toBe(sourceF32.toString());

    dest = [0, 0, 0, 0, 0];
    dest32.fill(0);
    let expected = [2, 3, 4, 5, 0].toString();
    expect(copy(source, dest, 1, 0)/*?.*/.toString()).toBe(expected);
    expect(copy(source, dest32, 1, 0)/*?.*/.toString()).toBe(expected);

    dest = [0, 0, 0, 0, 0];
    dest32.fill(0);
    expected = [4, 6, 8, 10, 0].toString();
    expect(copy(sourceF32, dest, 1, 0)/*?.*/.toString()).toBe(expected);
    expect(copy(sourceF32, dest32, 1, 0)/*?.*/.toString()).toBe(expected);

    dest = [0, 0, 0, 0, 0];
    dest32.fill(0);
    expected = [2, 3, 0, 0, 0].toString();
    expect(copy(source, dest, 1, 0, 2)/*?.*/.toString()).toBe(expected);
    expect(copy(source, dest32, 1, 0, 2)/*?.*/.toString()).toBe(expected);

    dest = [0, 0, 0, 0, 0];
    dest32.fill(0);
    expected = [4, 6, 0, 0, 0].toString();
    expect(copy(sourceF32, dest, 1, 0, 2)/*?.*/.toString()).toBe(expected);
    expect(copy(sourceF32, dest32, 1, 0, 2)/*?.*/.toString()).toBe(expected);

    dest = [0, 0, 0, 0, 0];
    dest32.fill(0);
    expected = [0, 2, 3, 0, 0].toString();
    expect(copy(source, dest, 1, 1, 2)/*?.*/.toString()).toBe(expected);
    expect(copy(source, dest32, 1, 1, 2)/*?.*/.toString()).toBe(expected);

    dest = [0, 0, 0, 0, 0];
    dest32.fill(0);
    expected = [0, 4, 6, 0, 0].toString();
    expect(copy(sourceF32, dest, 1, 1, 2)/*?.*/.toString()).toBe(expected);
    expect(copy(sourceF32, dest32, 1, 1, 2)/*?.*/.toString()).toBe(expected);
});
