import { EaseFunction, EaseInfo, Ease } from ".";

export class EaseManager {
    private readonly _lookup: Map<string, EaseInfo> = new Map<string, EaseInfo>();

    private _infos: EaseInfo[] | null = null;
    protected get infos() {
        if (!this._infos) {
            this._infos = Array.from(this._lookup.values());
        }

        return this._infos;
    }

    private static _instance: EaseManager = new EaseManager();
    static get instance(): EaseManager { return this._instance; }
    static set instance(value: EaseManager) { this._instance = value; }

    add(info: EaseInfo): void;
    add(name: string, ease: EaseFunction): void;
    add(param1: EaseInfo | string, ease?: EaseFunction): void {
        let info: EaseInfo;

        if (param1 instanceof EaseInfo)
            info = param1;
        else
            info = new EaseInfo(param1, ease!);

        this._lookup.set(info.name, info);
        this._infos = null;
    }

    addFrom(obj: object) {
        for (const name of Object.getOwnPropertyNames(obj)) {
            if (name === "length" || name === "name" || name === "prototype" || name === "constructor")
                continue;

            // @ts-ignore - indexer.
            const prop = obj[name];

            if (!(typeof prop === "function")) continue;

            this.add(name, prop);
        }
    }

    get(name: string) { return this._lookup.get(name); }

    getRandom(): EaseInfo;
    getRandom(count: number): EaseInfo[];
    getRandom(count?: number): EaseInfo | EaseInfo[] {
        if (count === undefined) {
            const index = Math.floor(Math.random() * this._lookup.size);
            return this.infos[index];
        }

        const result = new Array<EaseInfo>(count);

        for (let i = 0; i < count; i++) {
            const index = Math.floor(Math.random() * this._lookup.size);
            result[i] = this.infos[index];
        }

        return result;
    }

    getRandomEase(): EaseFunction;
    getRandomEase(count: number): EaseFunction[];
    getRandomEase(count?: number): EaseFunction | EaseFunction[] {
        if (count === undefined) {
            const index = Math.floor(Math.random() * this._lookup.size);
            return this.infos[index].ease;
        }

        const result = new Array<EaseFunction>(count);

        for (let i = 0; i < count; i++) {
            const index = Math.floor(Math.random() * this._lookup.size);
            result[i] = this.infos[index].ease;
        }

        return result;
    }

    static add(info: EaseInfo): void;
    static add(name: string, ease: EaseFunction): void;
    // @ts-ignore - unused params.
    static add(param1: EaseInfo | string, ease?: EaseFunction): void {
        // @ts-ignore - rest params.
        this.instance.add(...arguments);
    }

    static addFrom(obj: object) { this.instance.addFrom(obj); }
    static get(name: string) { return this.instance.get(name); }

    static getRandom(): EaseInfo;
    static getRandom(count: number): EaseInfo[];
    // @ts-ignore - unused params.
    static getRandom(count?: number): EaseInfo | EaseInfo[] {
        // @ts-ignore - rest params.
        return this.instance.getRandom(...arguments);
    }

    static getRandomEase(): EaseFunction;
    static getRandomEase(count: number): EaseFunction[];
    // @ts-ignore - unused params.
    static getRandomEase(count?: number): EaseFunction | EaseFunction[] {
        // @ts-ignore - rest params.
        return this.instance.getRandomEase(...arguments);
    }
}

EaseManager.instance.addFrom(Ease);
