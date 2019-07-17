import { ColorTweener } from '.';

export class ColorTweeners {
    private static _tweeners = new Map<string, ColorTweener>();

    static get(name: string) { return this._tweeners.get(name); }
    static add(name: string, tweener: ColorTweener) { this._tweeners.set(name, tweener); }
}
