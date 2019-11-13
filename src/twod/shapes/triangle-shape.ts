import { createPolyData, ITriangleShape, PolygonShapeBase } from '.';
import { IntegratorConstructor, populatePolyData } from '..';
import { Vector, VectorClass } from '../../vectors';

export class TriangleShape extends PolygonShapeBase implements ITriangleShape {
  readonly kind: "triangle";

  constructor(
    radius: number,
    startAngle?: number,
    regular?: boolean,
    integratorType?: IntegratorConstructor,
    vectorClass?: VectorClass);
  constructor(
    vertices: Vector[],
    integratorType?: IntegratorConstructor,
    vectorClass?: VectorClass);
  constructor(
    param1: number | Vector[],
    param2?: any,
    param3?: any,
    param4?: any,
    param5?: any) {

    if (typeof param1 === "number") {
      const radius = param1;
      const startAngle = param2;
      const regular = param3;
      const integratorType = param4;
      const vectorClass = param5;
      super(createPolyData(3, vectorClass), radius, undefined, integratorType);

      populatePolyData(this.data, radius, startAngle, regular);
    } else {
      const vertices = param1;
      const integratorType = param2;
      const vectorClass = param3;
      const data = createPolyData(3, vectorClass);
      const dataVertices = data.get("vertex").items;
      dataVertices[0].copyFrom(vertices[0]);
      dataVertices[1].copyFrom(vertices[1]);
      dataVertices[2].copyFrom(vertices[2]);
      super(data, undefined, undefined, integratorType);
    }

    this.kind = "triangle";
  }
}
