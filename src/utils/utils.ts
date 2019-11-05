import { IDisposable, Tristate } from '../core';

// @ts-ignore - no definition for stackTraceLimit.
Error.stackTraceLimit = 15;

export class Utils {
  static readonly CALLER_REGEX: string = String.raw`at (new \S+|\S+)( \[as (\S+)\])?`;

  static toString(value?: any) {
    return value === undefined ? undefined
      : value === null ? null
        : "" + value;
  }

  static assertNever(x: never) { throw new Error("Unexpected value: " + x); return undefined; }
  static isNull(value: any) { return value === null; }
  static isUndefined(value: any) { return value === undefined; }
  static isEmpty(value: any) { return value === undefined || value === null; }
  static hasValue<T>(value: T): value is T { return value !== undefined && value !== null; }
  static isNumber(v: Tristate<number>): v is number { return v !== undefined && v !== null && !isNaN(v); }

  static defaultUndefined<T>(value?: T, defaultValue?: T) {
    return value !== undefined ? value : defaultValue;
  }

  static defaultNull<T>(value?: T, defaultValue?: T) {
    return value !== null ? value : defaultValue;
  }

  static defaultNullOrUndefined<T>(value?: T, defaultValue?: T) {
    return value !== undefined && value !== null ? value : defaultValue;
  }

  static checkType<T>(constructor: Function, obj?: T) {
    if (!obj) return undefined;

    return obj instanceof constructor ? obj : undefined;
  }

  static disposable(method: () => void): IDisposable { return { dispose: method }; }

  static getCaller(...ignore: string[]) {
    const callstack = new Error().stack || "";
    const callerRegex = new RegExp(this.CALLER_REGEX, "mg");
    callerRegex.exec(callstack);
    callerRegex.exec(callstack);
    var match = callerRegex.exec(callstack);
    let caller = match && (match[3] || match[1]);

    while (match && (!caller || ignore.findIndex(x => caller!.startsWith(x)) >= 0)) {
      match = callerRegex.exec(callstack);
      caller = match && (match[3] || match[1]) || caller;
    }

    return caller || "";
  }
}
