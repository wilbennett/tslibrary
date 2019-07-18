import { PromiseEx } from '..';

describe.only("Should allow working manually with promises", () => {
    it("Should allow setting the result", () => {
        const promise = new PromiseEx<number>();

        expect.assertions(1);
        promise.resolve(1);
        return expect(promise).resolves.toBe(1);
    });

    it("Should allow setting failure", () => {
        const promise = new PromiseEx<number>();

        expect.assertions(1);
        promise.reject();
        return expect(promise).rejects.not.toBeNull();
    });

    it("Should allow catching failure", () => {
        const promise = new PromiseEx<number>();

        expect.assertions(1);
        promise.reject();
        return promise.catch(r => expect(r).not.toBeNull());
    });

    it("Should execute finally on success", () => {
        const promise = new PromiseEx<number>();

        expect.assertions(1);
        promise.resolve(1);
        return promise.finally(() => expect(true).toBeTruthy());
    });

    it("Should execute finally on failure", () => {
        const promise = new PromiseEx<number>();

        expect.assertions(1);
        promise.reject();
        return promise.finally(() => expect(true).toBeTruthy()).catch(_ => _);
    });

    it("Should allow accessing the underlying promise", () => {
        const promise = new PromiseEx<number>();

        expect.assertions(1);
        promise.resolve(1);
        return expect(promise.promise).resolves.toBe(1);
    });
});
