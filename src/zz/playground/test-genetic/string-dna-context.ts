import { MathEx } from '../../../core';
import { BasicDNA, BasicGene, GeneticContextBase } from '../../../genetic';

export type StringGene = BasicGene<String>;
export type StringDNA = BasicDNA<StringGene>;

export class StringDNAContext extends GeneticContextBase<StringGene> {
  constructor(public readonly target: string) {
    super();
  }

  createGene(): StringGene {
    return new BasicGene<String>(this, String.fromCharCode(MathEx.randomInt(32, 128)));
  }

  createDNA(empty?: boolean): StringDNA {
    return empty
      ? new BasicDNA<StringGene>(new Array(this.target.length))
      : new BasicDNA<StringGene>(this.createGenes(this.target.length));
  }

  calcFitness(dna: StringDNA) {
    const target = this.target;
    const genes = dna.genes;
    const count = genes.length;
    let score = 0;

    if (count === 0) {
      dna.fitness = 1;
      return dna.fitness;
    }

    for (let i = 0; i < count; i++) {
      genes[i].value === target[i] && (score++);
    }

    dna.fitness = score / target.length;
    return dna.fitness;
  }
}
