import { ShapePair } from '.';
import { Shape } from '../shapes';

export class ShapePairManager {
  pairs: ShapePair[] = [];
  pairsByShape = new Map<Shape, ShapePair[]>();
  pairsByPair = new Map<Shape, Map<Shape, ShapePair>>();

  clear() {
    this.pairs.splice(0);
    this.pairsByShape.clear();
    this.pairsByPair.clear();
  }

  getPairs(shape: Shape): ShapePair[] | undefined {
    return this.pairsByShape.get(shape);
  }

  getPair(shapeA: Shape, shapeB: Shape): ShapePair | undefined {
    const mapB = this.pairsByPair.get(shapeA);
    return mapB && mapB.get(shapeB);
  }

  addShape(shape: Shape, existingShapes: Set<Shape>) {
    const inverseMass = shape.massInfo.massInverse;
    const pairs = this.pairs;
    const pairsByShape = this.pairsByShape;
    const pairsByPairs = this.pairsByPair;
    const pairsForShape: ShapePair[] = [];
    const pairsMap = new Map<Shape, ShapePair>();
    pairsByPairs.set(shape, pairsMap);
    pairsByShape.set(shape, pairsForShape);

    for (const existing of existingShapes) {
      const pairsForExisting = this.getPairs(existing);
      const existingPairsMap = pairsByPairs.get(existing);

      if (inverseMass === 0 && existing.massInfo.massInverse === 0) continue;

      const newPair = new ShapePair(shape, existing);
      pairs.push(newPair);
      pairsForShape.push(newPair);
      pairsForExisting && pairsForExisting.push(newPair);
      pairsMap.set(existing, newPair);
      existingPairsMap && existingPairsMap.set(shape, newPair);
    }
  }

  removeShape(shape: Shape) {
    const pairs = this.pairs;
    const pairsByShape = this.pairsByShape;
    const pairsByPairs = this.pairsByPair;
    const pairsForShape: ShapePair[] | undefined = this.getPairs(shape);
    pairsByShape.delete(shape);
    pairsByPairs.delete(shape);

    if (!pairsForShape) return;

    pairsForShape.forEach(pair => {
      pairs.remove(pair);
      const otherShape = pair.shapeA === shape ? pair.shapeB : pair.shapeA;
      const pairsForOther = pairsByShape.get(otherShape);
      const otherPairsMap = pairsByPairs.get(otherShape);
      pairsForOther && pairsForOther.remove(pair);
      otherPairsMap && otherPairsMap.delete(shape);
    });
  }
}

