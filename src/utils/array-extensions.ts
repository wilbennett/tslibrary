export { };

declare global {
  interface Array<T> {
    remove(item: T): boolean;
  }
}

if (!Array.prototype.remove) {
  Array.prototype.remove = function (item: any) {
    let index = this.indexOf(item);

    if (index < 0) return false;

    this.splice(index, 1);
    return true;
  }
}
