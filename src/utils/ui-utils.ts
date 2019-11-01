export class UiUtils {
  static getElement<T extends HTMLElement>(id: string, shadow?: ShadowRoot | null) {
    return shadow ? <T>shadow.getElementById(id) : <T>document.getElementById(id);
  }

  static getSelectElement(id: string, shadow?: ShadowRoot | null) {
    return <HTMLSelectElement>UiUtils.getElement(id, shadow);
  }

  static getInputElement(id: string, shadow?: ShadowRoot | null) {
    return UiUtils.getElement<HTMLInputElement>(id, shadow);
  }

  static getDivElement(id: string, shadow?: ShadowRoot | null) {
    return UiUtils.getElement<HTMLDivElement>(id, shadow);
  }

  static getCanvasElement(id: string, shadow?: ShadowRoot | null) {
    return UiUtils.getElement<HTMLCanvasElement>(id, shadow);
  }

  static showElement(element: HTMLElement, showStyle: string = "inline") {
    element.style.display = showStyle;
  }

  static hideElement(element: HTMLElement) { element.style.display = "none"; }
  static isHidden(element: HTMLElement) { return element.style.display === "none"; }

  static displayElement(element: HTMLElement, show: any, showStyle: string = "inline") {
    if (show)
      UiUtils.showElement(element, showStyle);
    else
      UiUtils.hideElement(element);
  }
}
