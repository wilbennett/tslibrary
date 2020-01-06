import { MathEx } from '../../../../core';

export class DNA {
  constructor(public target: string) {
    this.genes = Array.from({ length: target.length }, () => String.fromCharCode(MathEx.randomInt(32, 128)));
  }

  genes: string[] = [];
  fitness: number = 0;

  calcFitness() {
    const target = this.target;
    const genes = this.genes;
    const count = genes.length;
    let score = 0;

    for (let i = 0; i < count; i++) {
      genes[i] === target[i] && (score++);
    }

    this.fitness = score / target.length;
  }

  crossover(partner: DNA) {
    const child = new DNA(this.target);
    const childGenes = child.genes;
    const genes = this.genes;
    const partnerGenes = partner.genes;
    const count = genes.length;
    const midpoint = MathEx.randomInt(this.genes.length - 1);

    for (let i = 0; i < count; i++) {
      if (i > midpoint)
        childGenes[i] = genes[i];
      else
        childGenes[i] = partnerGenes[i];
    }

    return child;
  }

  mutate(mutationRate: number) {
    const genes = this.genes;
    const count = genes.length;

    for (let i = 0; i < count; i++) {
      if (Math.random() < mutationRate)
        genes[i] = String.fromCharCode(MathEx.randomInt(32, 128));
    }
  }

  getPhrase() { return this.genes.join(""); }
}
