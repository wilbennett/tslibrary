import { IPolygonShape, PolygonShapeBase, ShapeBase } from '.';
import { IntegratorConstructor, normalizePolyCenter, populatePolyData, populatePolyEdgeNormals } from '..';
import { Vector, VectorClass, VectorGroupsBuilder } from '../../vectors';

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
  kind: "polygon";

  constructor(
    vertexCount: number,
    radius: number,
    startAngle?: number,
    regular?: boolean,
    integratorType?: IntegratorConstructor,
    vectorClass?: VectorClass);
  constructor(
    vertices: Vector[],
    isWorld?: boolean,
    integratorType?: IntegratorConstructor,
    vectorClass?: VectorClass);
  constructor(
    param1: number | Vector[],
    param2?: any,
    param3?: any,
    param4?: any,
    param5?: any,
    param6?: any) {
    if (typeof param1 === "number") {
      const vertexCount: number = param1;
      const radius: number = param2;
      const startAngle: number | undefined = param3;
      const regular: boolean | undefined = param4;
      const integratorType: IntegratorConstructor | undefined = param5;
      const vectorClass: VectorClass = param6 || ShapeBase.vectorClass;
      super(createPolyData(vertexCount, vectorClass), radius, undefined, integratorType);

      populatePolyData(this.data, radius, startAngle, regular);
    } else {
      const inputVertices: Vector[] = param1;
      const isWorld: boolean = param2;
      const integratorType: IntegratorConstructor | undefined = param3;
      const vectorClass: VectorClass = param4 || ShapeBase.vectorClass;

      const vertexCount = inputVertices.length;
      const data = createPolyData(vertexCount, vectorClass);
      const vertexList = data.get("vertex");
      const vertices = vertexList.items;

      for (let i = 0; i < vertexCount; i++) {
        inputVertices[i].copyTo(vertices[i]);
      }

      const [radius, center, area] = normalizePolyCenter(vertexList);

      super(data, radius, area, integratorType);

      if (isWorld)
        this._isWorld = isWorld;

      populatePolyEdgeNormals(data);
      this.position.copyFrom(center);
    }

    this.kind = "polygon";
  }
}
