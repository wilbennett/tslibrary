import { createPolyData, IPolygonShape, PolygonShapeBase, Shape } from '.';
import { IntegratorConstructor, normalizePolyCenter, populatePolyEdgeNormals } from '..';
import { VectorClass } from '../../vectors';
import * as Minkowski from './minkowski';

export class MinkowskiPolyShape extends PolygonShapeBase implements IPolygonShape {
  kind: "polygon";

  constructor(
    first: Shape,
    second: Shape,
    sum: boolean = false,
    integratorType?: IntegratorConstructor,
    vectorClass?: VectorClass) {

    const msPoints = sum ? Minkowski.createSum(first, second) : Minkowski.createDiff(first, second);

    if (!msPoints)
      throw new Error(`Minkoski sum not supported for ${first.constructor.name} and ${second.constructor.name}`);

    const vertexCount = msPoints.length;
    const data = createPolyData(vertexCount, vectorClass);
    const vertexList = data.get("vertex");
    const vertices = vertexList.items;

    for (let i = 0; i < vertexCount; i++) {
      msPoints[i].point.copyTo(vertices[i]);
    }

    const [radius, center, area] = normalizePolyCenter(vertexList);

    super(data, radius, area, integratorType);

    populatePolyEdgeNormals(data);
    this.position.copyFrom(center);

    this.kind = "polygon";
  }
}
