import { BasicDNA, DNAFactory } from '../../../genetic';
import { CharGene } from './char-gene';

export type StringDNA = BasicDNA<CharGene>;

export class StringDnaFactory implements DNAFactory<CharGene> {
  createDNA(genes: CharGene[]): StringDNA {
    return new BasicDNA<CharGene>(genes);
  }
}
