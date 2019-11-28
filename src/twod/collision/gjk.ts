import { ColliderBase, ShapePair } from '.';
import { dir, Vector } from '../../vectors';
import { MinkowskiShape, Simplex, SimplexCallback } from '../shapes';

const ZERO_DIRECTION = dir(0, 0);

export class GjkState {
  constructor(shapes: ShapePair) {
    this.shape = new MinkowskiShape(shapes.first, shapes.second, false);
  }

  shape: MinkowskiShape;
  simplex: Simplex = new Simplex();
  unsupported?: boolean;
}

export class Gjk extends ColliderBase {
  maxIterations = 20;

  isCollidingProgress(shapes: ShapePair, callback?: SimplexCallback): boolean | undefined {
    const state = this.getState(shapes);

    if (state.unsupported) return undefined;

    const shape = state.shape;
    const simplex = state.simplex;
    const points = simplex.points;
    const direction = simplex.direction;
    simplex.reset();
    shapes.second.position.subO(shapes.first.position, direction);

    if (direction.equals(ZERO_DIRECTION))
      direction.withXY(1, 0);

    const support = shape.getSupport(direction);

    if (!support) return undefined;

    points.push(support.clone());
    callback && callback(simplex.clone());
    direction.negate();
    let i = this.maxIterations;

    while (i-- > 0) {
      //! Always return with a 2 simplex for EPA to work. So don't process the first point.
      const b = points[points.length - 1];

      if (b.worldPoint.dot(direction) > 0)
        return false; // b is already in front of the origin in the direction.

      shape.getSupport(direction, support);
      points.push(support.clone());
      callback && callback(simplex.clone());

      if (support.worldPoint.dot(direction) <= 0)
        return false; // Did not find a point further in the direction.

      if (this.containsOrigin(simplex)) return true;
    }

    return false;
  }

  protected isCollidingCore(shapes: ShapePair): boolean | undefined {
    return this.isCollidingProgress(shapes);
  }

  protected containsOrigin(simplex: Simplex) {
    const points = simplex.points;
    const length = points.length;
    const direction = simplex.direction;
    const a = points[length - 1].worldPoint;
    let b: Vector;
    let c: Vector;
    let ba: Vector;
    const ao = a.negateO();

    switch (length) {
      case 2:
        b = points[0].worldPoint;
        // ba = simplex.winding === Winding.CCW ? a.subO(b, direction) : b.subO(a, direction);
        // ba = a.scaledSubScaledO(b, simplex.winding, direction);
        ba = a.subO(b, direction);

        // Set direction towards the origin.
        if (ba.cross2D(ao) > 0) // ba is on the right of ao.
          ba.perpLeft();
        else {
          ba.perpRight();
        }

        //! Always return with a 2 simplex for EPA to work. So don't check if we contain the origin.
        break;
      case 3:
        //                 CCW                  .             CW         
        //=====================================================================
        //                                      .                        
        //          R6 |    R2     |  R1        .     R6 |    R2     |  R1
        //         __ b <---------- c __        .    __ c ----------> b __
        //              \         /             .         \         /     
        //*              \   R5  /              .          \   R5  /      
        //*            R4 \     / R3            .        R3 \     / R4    
        //                 \   /                .            \   /        
        //                  \ /                 .             \ /         
        //                 / a \                .            / a \        
        //                /  R7 \               .           /  R7 \       
        //
        //
        //* Origin can't be in: R1, R2, R6 or R7
        //* Only need to check R3, R4 and R5
        //
        b = points[1].worldPoint;
        c = points[0].worldPoint;
        ba = a.subO(b);
        const ac = c.subO(a);
        const baSide = ao.cross2D(ba);
        const acSide = ao.cross2D(ac);

        if (!(baSide * acSide < 0)) return true; // R5

        const ab = b.subO(a);

        if (ac.cross2D(ab) > 0) { // CCW.
          if (baSide > 0) { // R4.
            ba.perpRightO(direction);
            // TODO: Optimize. Shift is expensive.
            points.shift(); // Remove c.
          } else { // R3.
            ac.perpRightO(direction);
            // TODO: Optimize. Splice is expensive.
            points.splice(1, 1); // Remove b.
          }
        } else { // CW.
          if (baSide < 0) { // R4
            ba.perpLeftO(direction);
            points.shift(); // Remove c.
          } else { // R3.
            ac.perpLeftO(direction);
            points.splice(1, 1); // Remove b.
          }
        }
        break;
      default:
        throw new Error(`Unexpected number of simplex points: ${length}`);
    }

    return false;
  }

  protected getState(shapes: ShapePair) {
    let state = <GjkState>shapes.customData["gjkState"];

    if (!state) {
      // const { first, second } = shapes;
      state = new GjkState(shapes);
      shapes.customData["gjkState"] = state;
    }

    return state;
  }
}
