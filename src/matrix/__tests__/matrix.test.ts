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
});
