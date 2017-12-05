import { Util } from "../util";

// ## Math
// #### Matrices, points, and other mathy stuff
// ------------------

interface IMatrixArray {
    slice: () => IMatrix;
    length: number;
}

export type IMatrix = IMatrixArray | [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
];

// Pool object to speed computation and reduce object creation
let ARRAY_POOL: IMatrix = new Array<number>(16);

// Definition of identity matrix values
export const IDENTITY: IMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

// Indices with which to transpose the matrix array
const TRANSPOSE_INDICES: IMatrix = [
    0, 4, 8, 12,
    1, 5, 9, 13,
    2, 6, 10, 14,
    3, 7, 11, 15
];

// The `Matrix` class stores transformations in the scene. These include:
// (1) Camera Projection and Viewport transformations.
// (2) Transformations of any `Transformable` type object, such as `Shape`s or `Model`s
//
// Most of the methods on `Matrix` are destructive, so be sure to use `.copy()`
// when you want to preserve an object's value.
export class Matrix {
    public m: IMatrix;
    private baked: IMatrix;

    // Accepts a 16-value `Array`, defaults to the identity matrix.
    constructor(m?: IMatrix) {
        this.m = m || IDENTITY.slice();
        this.baked = IDENTITY;
    }

    // Returns a new matrix instances with a copy of the value array
    public copy() {
        return new Matrix(this.m.slice());
    }

    // Multiply by the 16-value `Array` argument. This method uses the
    // `ARRAY_POOL`, which prevents us from having to re-initialize a new
    // temporary matrix every time. This drastically improves performance.
    public matrix(m) {
        const c = ARRAY_POOL;
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 16; i += 4) {
                c[i + j] =
                    m[i] * this.m[j] +
                    m[i + 1] * this.m[4 + j] +
                    m[i + 2] * this.m[8 + j] +
                    m[i + 3] * this.m[12 + j];
            }
        }
        ARRAY_POOL = this.m;
        this.m = c;
        return this;
    }

    // Resets the matrix to the baked-in (default: identity).
    public reset() {
        this.m = this.baked.slice();
        return this;
    }

    // Sets the array that this matrix will return to when calling `.reset()`.
    // With no arguments, it uses the current matrix state.
    public bake(m?: IMatrix) {
        this.baked = (m != null ? m : this.m).slice();
        return this;
    }

    // Multiply by the `Matrix` argument.
    public multiply(b: Matrix) {
        return this.matrix(b.m);
    }

    // Tranposes this matrix
    public transpose() {
        const c = ARRAY_POOL;
        for (let i = 0; i < TRANSPOSE_INDICES.length; i++) {
            const ti = TRANSPOSE_INDICES[i];
            c[i] = this.m[ti];
        }
        ARRAY_POOL = this.m;
        this.m = c;
        return this;
    }

    // Apply a rotation about the X axis. `Theta` is measured in Radians
    public rotx(theta: number) {
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const rm = [1, 0, 0, 0, 0, ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1];
        return this.matrix(rm);
    }

    // Apply a rotation about the Y axis. `Theta` is measured in Radians
    public roty(theta: number) {
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const rm = [ct, 0, st, 0, 0, 1, 0, 0, -st, 0, ct, 0, 0, 0, 0, 1];
        return this.matrix(rm);
    }

    // Apply a rotation about the Z axis. `Theta` is measured in Radians
    public rotz(theta: number) {
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const rm = [ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        return this.matrix(rm);
    }

    // Apply a translation. All arguments default to `0`
    public translate(x = 0, y = 0, z = 0) {
        const rm = [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
        return this.matrix(rm);
    }

    // Apply a scale. If not all arguments are supplied, each dimension (x,y,z)
    // is copied from the previous arugment. Therefore, `_scale()` is equivalent
    // to `_scale(1,1,1)`, and `_scale(1,-1)` is equivalent to `_scale(1,-1,-1)`
    public scale(sx: number, sy: number, sz: number) {
        if (sx == null) {
            sx = 1;
        }
        if (sy == null) {
            sy = sx;
        }
        if (sz == null) {
            sz = sy;
        }
        const rm = [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
        return this.matrix(rm);
    }

    public equals(b: Matrix) {
        return Util.arraysEqual(this.m as number[], b.m as number[]);
    }
}

// A convenience method for constructing Matrix objects.
export const M = (m?: IMatrix) => {
    return new Matrix(m);
};

// A few useful Matrix objects.
export const Matrices = {
    identity() {
        return M();
    },
    flipX() {
        return M().scale(-1, 1, 1);
    },
    flipY() {
        return M().scale(1, -1, 1);
    },
    flipZ() {
        return M().scale(1, 1, -1);
    }
};
