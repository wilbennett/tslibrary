import { Color } from '.';
import { ColorCollection } from './collections';

export class ColorUtilities {
  protected _byKey?: Map<number, Color>;
  protected _byName?: Map<string, Color>;
  protected _collections: ColorCollection[] = [];
  protected _singles: Color[] = [];

  get(name: string): Color;
  get(id: number): Color;
  get(r: number, g: number, b: number, a: number): Color;
  get(param1: string | number, g?: number, b?: number, a?: number) {
    if (!this._byKey) this.populateLookups();

    if (typeof param1 === "string")
      return this._byName!.get(param1.toLowerCase());

    const key = arguments.length === 1 ? param1 : Color.calcKey(param1, g!, b!, a!);
    return this._byKey!.get(key);
  }

  add(color: Color) {
    this.addColorByKey(color);
    this.addColorByName(color);
    this._singles.push(color);
  }

  addCollection(colors: ColorCollection) {
    this._collections.push(colors);
    this._byKey = undefined;
    this._byName = undefined;
  }

  clear() {
    this._collections = [];
    this._singles = [];
    this._byKey = undefined;
    this._byName = undefined;
  }

  refresh() { this.populateLookups(); }

  protected addColorByKey(color: Color) {
    if (color.isWebColor && !color.name) return;

    const existing = this.get(color.id);

    if (existing && existing.isWebColor) return;

    this._byKey!.set(color.id, color);
  }

  protected addColorByName(color: Color) {
    if (!color.name) return;

    this._byName!.set(color.name.toLowerCase(), color);
  }

  protected addCollectionToLookups(colors: ColorCollection) {
    for (let name in colors) {
      if (name[0] === "_") continue;
      if (typeof colors[name] === "function") continue;

      const color: Color = colors[name];
      this.addColorByKey(color);
      this.addColorByName(color);
    }
  }

  protected populateLookups() {
    this._byKey = new Map<number, Color>();
    this._byName = new Map<string, Color>();

    this._collections.forEach(colors => this.addCollectionToLookups(colors));

    this._singles.forEach(color => {
      this.addColorByKey(color);
      this.addColorByName(color);
    });
  }
}

export let Colors: ColorUtilities = new ColorUtilities();
