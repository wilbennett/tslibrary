export class PromiseEx<T> {
    private _resolve!: (value?: T | PromiseLike<T>) => void;
    private _reject!: (reason?: any) => void;

    constructor() {
        const self = this;

        this._promise = new Promise<T>((resolve, reject) => {
            self._resolve = resolve;
            self._reject = reject;
        });
    }

    private _promise: Promise<T>;
    get promise() { return this._promise; }

    resolve(value?: T | PromiseLike<T>) { this._resolve(value); }
    reject(reason?: any) { this._reject(reason); }

    then<R>(onfulfilled?: (v: T) => R | PromiseLike<R>, onrejected?: (reason?: any) => PromiseLike<never>) {
        return this._promise.then(onfulfilled, onrejected);
    }

    catch(onrejected?: (reason?: any) => PromiseLike<never>) { return this._promise.catch(onrejected); }
    finally(f: () => void) { return this._promise.finally(f); }
}
