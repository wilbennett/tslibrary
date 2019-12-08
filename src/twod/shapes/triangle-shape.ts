import { ITriangleShape, PolygonShapeBase } from '.';
import { IntegratorClass } from '..';
import { MassInfo, Material } from '../../core';
import { pos, Vector, VectorClass } from '../../vectors';
import { generatePoly } from '../geometry';

export class TriangleShape extends PolygonShapeBase implements ITriangleShape {
  readonly kind: "triangle";

  constructor(
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
    param7?: any) {

    if (typeof param1 === "number") {
      const radius = param1;
      const startAngle = param2;
      const regular = param3;
      const material = param4;
      const massInfo = param5;
      const integratorType = param6;
      const vectorClass = param7;
      const vertices = Array.from<Vector, Vector>({ length: 3 }, () => pos(0, 0));
      generatePoly(vertices, radius, startAngle, regular);

      super(vertices, false, material, massInfo, vectorClass, integratorType);
    } else {
      const vertices = param1;
      const material = param2;
      const isWorld = param3;
      const massInfo = param4;
      const integratorType = param5;
      const vectorClass = param6;

      super(vertices.slice(0, 3), isWorld, material, massInfo, vectorClass, integratorType);
    }

    this.kind = "triangle";
  }
}
