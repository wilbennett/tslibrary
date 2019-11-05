import { ContextProps, Viewport } from '..';

export class GeometryBase {
  protected _props?: ContextProps;
  get props() { return this._props || { strokeStyle: "black", fillStyle: "black" }; }
  set props(value) { this._props = value; }

  lineDash?: number[];

  // @ts-ignore - unused param.
  protected renderCore(viewport: Viewport) { }

  render(viewport: Viewport) {
    const ctx = viewport.ctx;
    const props = this.props;
    let lineWidth = viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);

    const origLineDash = ctx.getLineDash();
    this.lineDash && ctx.setLineDash(this.lineDash);
    ctx.withProps(props).withLineWidth(lineWidth);

    this.renderCore(viewport);

    ctx.setLineDash(origLineDash);
  }
}
