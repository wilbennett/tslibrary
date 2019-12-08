import { IPolygonShapeBase, ShapeBase } from '.';
import { ContextProps, IntegratorClass, Viewport } from '..';
import { MassInfo, Material } from '../../core';
import { Vector, VectorClass, VectorGroupsBuilder } from '../../vectors';
import {
  calcPolyCenterAreaInertia,
  calcPolyRadius,
  movePoly,
  normalizePolyCenter,
  populatePolyEdgeNormals,
} from '../geometry';

export function createPolyData(
  vertexCount: number,
  vectorClass: VectorClass = ShapeBase.vectorClass) {
  const builder = new VectorGroupsBuilder();
  builder.add("vertex", vertexCount, vectorClass);
  builder.add("edge", vertexCount, vectorClass);
  builder.add("normal", vertexCount, vectorClass);
  return builder.Groups;
}

export abstract class PolygonShapeBase extends ShapeBase implements IPolygonShapeBase {
  constructor(
    inputVertices: Vector[],
    isWorld: boolean = false,
    material?: Material,
    massInfo?: MassInfo,
    vectorClass?: VectorClass,
    integratorType?: IntegratorClass) {

    let radius: number;
    let center: Vector;
    let area: number;
    let inertia: number;

    if (!isWorld)
      [radius, center, area, inertia] = normalizePolyCenter(inputVertices);
    else {
      [center, area, inertia] = calcPolyCenterAreaInertia(inputVertices);
      radius = calcPolyRadius(inputVertices, center);
    }

    super(area, isWorld, material, massInfo, integratorType, _ => inertia);

    const vertexCount = inputVertices.length;
    this._data = createPolyData(vertexCount, vectorClass);
    const vertexList = this._data.get("vertex");
    const vertices = vertexList.items;

    for (let i = 0; i < vertexCount; i++) {
      inputVertices[i].copyTo(vertices[i]);
    }

    populatePolyEdgeNormals(this._data);
    this.position.copyFrom(center);
    this.radius = radius;
  }

  readonly radius: number;

  setPosition(position: Vector) {
    if (this._isWorld)
      movePoly(this.vertexList, this.position, position);

    super.setPosition(position);
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    ctx.beginPath().poly(this.vertexList, true);

    if (props.fillStyle)
      ctx.fill();

    if (props.strokeStyle)
      ctx.stroke();
  }
}
