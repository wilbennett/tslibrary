import { copy, Matrix2, MatrixData, MatrixValues } from '.';

const IDENTITY: number[] = [1, 0, 0, 1, 0, 0];

function createValues(): MatrixValues { return [0, 0, 0, 0, 0, 0]; }
function getIdentity(result: MatrixValues): MatrixValues { return copy(IDENTITY, result); }
function createIdentity() { return getIdentity(createValues()); }

export class Matrix2D extends Matrix2 {
    constructor() {
        super(new MatrixData(createIdentity(), createIdentity()));
    }

    createValues(): MatrixValues { return createValues(); }
    getIdentity(result: MatrixValues): MatrixValues { return getIdentity(result); }
}
