import { BasicDNA, DNAFactory } from '../../../genetic';
import { UniqueCharGene } from './unique-char-gene';

export class UniqueStringDnaFactory implements DNAFactory<UniqueCharGene> {
  createDNA(genes: UniqueCharGene[]): BasicDNA<UniqueCharGene> {
    return new BasicDNA<UniqueCharGene>(genes);
  }
}
