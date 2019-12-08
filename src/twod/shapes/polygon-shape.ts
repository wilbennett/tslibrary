import { IPolygonShape, PolygonShapeBase, ShapeBase } from '.';
import { IntegratorClass } from '..';
import { MassInfo, Material } from '../../core';
import { pos, Vector, VectorClass } from '../../vectors';
import { generatePoly } from '../geometry';

export class PolygonShape extends PolygonShapeBase implements IPolygonShape {
  kind: "polygon";

  constructor(
    vertexCount: number,
    radius: number,
    startAngle?: number,
    regular?: boolean,
    material?: Material,
    massInfo?: MassInfo,
    integratorType?: IntegratorClass,
    vectorClass?: VectorClass);
  constructor(
    vertices: Vector[],
    material?: Material,
    isWorld?: boolean,
    massInfo?: MassInfo,
    integratorType?: IntegratorClass,
    vectorClass?: VectorClass);
  constructor(
    param1: number | Vector[],
    param2?: any,
    param3?: any,
    param4?: any,
    param5?: any,
    param6?: any,
    param7?: any,
    param8?: any) {
    if (typeof param1 === "number") {
      const vertexCount: number = param1;
      const radius: number = param2;
      const startAngle: number | undefined = param3;
      const regular: boolean | undefined = param4;
      const material: Material | undefined = param5;
      const massInfo: MassInfo | undefined = param6;
      const integratorType: IntegratorClass | undefined = param7;
      const vectorClass: VectorClass = param8 || ShapeBase.vectorClass;
      const vertices = Array.from<Vector, Vector>({ length: vertexCount }, () => pos(0, 0));
      generatePoly(vertices, radius, startAngle, regular);

      super(vertices, false, material, massInfo, vectorClass, integratorType);
    } else {
      const vertices: Vector[] = param1;
      const material: Material | undefined = param2;
      const isWorld: boolean = param3;
      const massInfo: MassInfo | undefined = param4;
      const integratorType: IntegratorClass | undefined = param5;
      const vectorClass: VectorClass = param6 || ShapeBase.vectorClass;

      super(vertices, isWorld, material, massInfo, vectorClass, integratorType);
    }

    this.kind = "polygon";
  }
}
