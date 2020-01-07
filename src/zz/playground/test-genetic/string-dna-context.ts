import { MathEx } from '../../../core';
import { BasicDNA, BasicGene, GeneticContext } from '../../../genetic';

export type StringGene = BasicGene<String>;
export type StringDNA = BasicDNA<StringGene>;

export class StringDNAContext implements GeneticContext<StringGene> {
  constructor(public readonly target: string) {
  }

  createGene(): StringGene {
    return new BasicGene<String>(this, String.fromCharCode(MathEx.randomInt(32, 128)));
  }

  createGenes(count: number): StringGene[] {
    return Array.from(
      { length: count },
      () => new BasicGene<String>(this, String.fromCharCode(MathEx.randomInt(32, 128))));
  }

  createDNA(): StringDNA { return new BasicDNA<StringGene>(this.createGenes(this.target.length)); }

  createPopulation(count: number): StringDNA[] {
    return Array.from({ length: count }, () => new BasicDNA<StringGene>(this.createGenes(this.target.length)));
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

  crossover(...partners: StringDNA[]): StringDNA {
    const child = this.createDNA();// new StringDNA(new Array(partners[0].genes.length));
    const childGenes = child.genes;
    const partnerGenesA = partners[0].genes;
    const partnerGenesB = partners[1].genes;
    const count = partnerGenesA.length;
    const midpoint = MathEx.randomInt(partnerGenesA.length - 1);

    for (let i = 0; i < count; i++) {
      if (i > midpoint)
        childGenes[i] = partnerGenesA[i];
      else
        childGenes[i] = partnerGenesB[i];
    }

    return child;
  }

  mutate(dna: StringDNA, mutationRate: number): void {
    const genes = dna.genes;
    const count = genes.length;

    for (let i = 0; i < count; i++) {
      if (Math.random() < mutationRate)
        genes[i] = genes[i].createMutation(genes, i);
    }
  }
}
