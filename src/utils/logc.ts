import { TagFunction } from '.';

export const CSS_START = ";";
export const NORMAL = CSS_START + "CSSEND";

export function logc(startString: string): TagFunction;
export function logc(strings: TemplateStringsArray, ...keys: any[]): void;
export function logc(param1: string | TemplateStringsArray, ...keys: any[]): TagFunction | void {
  const fn = (cssStart: string, strings: TemplateStringsArray, ...keys: any[]) => {
    const css: string[] = [];
    const startIndex = cssStart.length;

    const text = keys.reduce((acc, cur, i) => {
      if (cur === NORMAL) {
        css.push("all:inherit");
        return acc + "%c" + strings[i + 1];
      } else if (typeof cur === "string" && cur.startsWith(cssStart)) {
        css.push(";" + cur.substr(startIndex));
        return acc + "%c" + strings[i + 1];
      }

      return acc + cur + strings[i + 1];
    }, strings[0]);

    console.log(text, ...css);
  };

  if (typeof param1 === "string")
    return fn.bind(null, param1);

  return fn(CSS_START, param1, ...keys);
}

export function css(startString: string): any;
export function css(strings: TemplateStringsArray, ...keys: any[]): any;
export function css(param1: string | TemplateStringsArray, ...keys: any[]): any {
  const fn = (cssStart: string, strings: TemplateStringsArray, ...keys: any[]) => {
    const css: string[] = [];
    const startIndex = cssStart.length;

    const text = keys.reduce((acc, cur, i) => {
      if (cur === NORMAL) {
        css.push("all:inherit");
        return acc + "%c" + strings[i + 1];
      } else if (typeof cur === "string" && cur.startsWith(cssStart)) {
        css.push(";" + cur.substr(startIndex));
        return acc + "%c" + strings[i + 1];
      }

      return acc + cur + strings[i + 1];
    }, strings[0]);

    return [text, ...css];
  };

  if (typeof param1 === "string")
    return fn.bind(null, param1);

  return fn(CSS_START, param1, ...keys);
}
