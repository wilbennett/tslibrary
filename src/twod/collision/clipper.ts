import { ContactPoint } from '.';
import { Edge } from '../shapes';

export interface Clipper {
  clip(incidentEdge: Edge, referenceEdge: Edge, result?: ContactPoint[]): ContactPoint[];
}
