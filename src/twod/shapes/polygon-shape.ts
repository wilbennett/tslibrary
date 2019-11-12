import { IPolygonShape, ShapeBase } from '.';
import { ContextProps, EulerSemiImplicit, Integrator, IntegratorConstructor, populatePolyGroup, Viewport } from '..';
import { VectorGroupsBuilder } from '../../vectors';

export class PolygonShape extends ShapeBase implements IPolygonShape {
  kind: "polygon" = "polygon";

  // TODO: Add irregular polygon support.
  // TODO: Make vector dimension agnostic.
  constructor(
    vertexCount: number,
    radius: number,
    startAngle?: number,
    regular?: boolean,
    integratorType?: IntegratorConstructor);
  constructor(
    vertexCount: number,
    radius: number,
    startAngle?: number,
    regular?: boolean,
    integratorType: IntegratorConstructor = EulerSemiImplicit) {
    super();

    this.radius = radius;

    const builder = new VectorGroupsBuilder();
    builder.add("vertex", vertexCount, ShapeBase.vectorClass);
    builder.add("edge", vertexCount, ShapeBase.vectorClass);
    builder.add("normal", vertexCount, ShapeBase.vectorClass);
    this._data = builder.Groups;

    populatePolyGroup(this._data, radius, startAngle, regular);

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
    ctx.beginPath().poly(this.vertices, true);

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
