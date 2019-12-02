import { Vector } from '../../vectors';
import { Edge } from '../shapes';

export interface Clipper {
  clip(incidentEdge: Edge, referenceEdge: Edge, result?: Vector[]): Vector[];
}
