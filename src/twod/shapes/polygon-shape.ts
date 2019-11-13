import { IPolygonShape, PolygonShapeBase, ShapeBase } from '.';
import { EulerSemiImplicit, IntegratorConstructor, populatePolyData } from '..';
import { VectorClass, VectorGroupsBuilder } from '../../vectors';

export function createPolyData(
  vertexCount: number,
  vectorClass: VectorClass = ShapeBase.vectorClass) {
  const builder = new VectorGroupsBuilder();
  builder.add("vertex", vertexCount, vectorClass);
  builder.add("edge", vertexCount, vectorClass);
  builder.add("normal", vertexCount, vectorClass);
  return builder.Groups;
}

export class PolygonShape extends PolygonShapeBase implements IPolygonShape {
  kind: "polygon" = "polygon";

  constructor(
    vertexCount: number,
    radius: number,
    startAngle?: number,
    regular?: boolean,
    integratorType?: IntegratorConstructor,
    vectorClass?: VectorClass);
  constructor(
    vertexCount: number,
    radius: number,
    startAngle?: number,
    regular?: boolean,
    integratorType: IntegratorConstructor = EulerSemiImplicit,
    vectorClass: VectorClass = ShapeBase.vectorClass) {
    super(createPolyData(vertexCount, vectorClass), radius, undefined, integratorType);

    populatePolyData(this.data, radius, startAngle, regular);
  }
}
