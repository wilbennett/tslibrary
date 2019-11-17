import { IPolygonShapeBase, ShapeBase } from '.';
import { ContextProps, EulerSemiImplicit, Integrator, IntegratorConstructor, Viewport } from '..';
import { VectorGroups } from '../../vectors';
import { normalizePolyCenter } from '../geometry';

export abstract class PolygonShapeBase extends ShapeBase implements IPolygonShapeBase {
  constructor(
    data: VectorGroups,
    radius?: number,
    // @ts-ignore - unused param.
    area?: number,
    integratorType: IntegratorConstructor = EulerSemiImplicit) {
    super();

    this._data = data;

    if (radius === undefined) {
      [radius] = normalizePolyCenter(this.vertexList);
    }

    this.radius = radius;

    this._integratorType = integratorType;
    this._integrator = new integratorType();
    this._integrators = [this._integrator];
  }

  protected _integratorType: IntegratorConstructor;
  protected _integrator: Integrator;
  protected _integrators: Integrator[];
  get integrators() { return this._integrators; }
  get position() { return this._integrator.position; }
  set position(value) {
    this._integrator.position = value;
    this.dirtyTransform();
  }
  readonly radius: number;

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    ctx.beginPath().poly(this.vertexList, true);

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
