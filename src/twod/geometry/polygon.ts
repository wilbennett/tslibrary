import { IPolygon, PolygonBase } from '.';
import { Vector2D, VectorCollection } from '../../vectors';
import * as Poly from './polygon-utils';

export class Polygon extends PolygonBase implements IPolygon {
  kind: "polygon" = "polygon";

  constructor(
    vertexCount: number,
    radius: number,
    startAngle?: number,
    regular?: boolean) {
    super(new VectorCollection(vertexCount, Vector2D), radius); // TODO: Make dimension agnostic.

    Poly.generatePoly(this.vertexList, radius, startAngle, regular);
  }
}
