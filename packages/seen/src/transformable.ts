import { IDENTITY, IMatrix, Matrix } from "./geometry/matrix";

/**
 * `Transformable` base class extended by `Shape` and `Model`.
 *
 * The advantages of keeping transforms in `Matrix` form are
 * 1) lazy computation of point position
 * 2) ability combine hierarchical transformations easily
 * 3) ability to reset transformations to an original state.
 *
 * Resetting transformations is especially useful when you want to animate
 * interpolated values. Instead of computing the difference at each animation
 * step, you can compute the global interpolated value for that time step and
 * apply that value directly to a matrix (once it is reset).
 */
export class Transformable {
    public m: Matrix;

    constructor() {
        this.m = new Matrix();
    }

    /**
     * Multiply by the 16-value `Array` argument. This method uses the
     * `ARRAY_POOL`, which prevents us from having to re-initialize a new
     * temporary matrix every time. This drastically improves performance.
     */
    public matrix(m: IMatrix) {
        return this.m.matrix(m);
    }

    /**
     * Resets the matrix to the baked-in (default: identity).
     */
    public reset() {
        return this.m.reset();
    }

    /**
     * Sets the array that this matrix will return to when calling `.reset()`.
     * With no arguments, it uses the current matrix state.
     */
    public bake(m: IMatrix) {
        return this.m.bake(m);
    }

    /**
     * Apply a rotation about the X axis. `Theta` is measured in Radians
     */
    public rotx(theta: number) {
        this.m.rotx(theta);
        return this;
    }

    /**
     * Apply a rotation about the Y axis. `Theta` is measured in Radians
     */
    public roty(theta: number) {
        this.m.roty(theta);
        return this;
    }

    /**
     * Apply a rotation about the Z axis. `Theta` is measured in Radians
     */
    public rotz(theta: number) {
        this.m.rotz(theta);
        return this;
    }

    /**
     * Apply a translation. All arguments default to `0`
     */
    public translate(x: number, y: number, z: number) {
        this.m.translate(x, y, z);
        return this;
    }

    /**
     * Apply a scale. If not all arguments are supplied, each dimension (x,y,z)
     * is copied from the previous arugment. Therefore, `_scale()` is equivalent
     * to `_scale(1,1,1)`, and `_scale(1,-1)` is equivalent to `_scale(1,-1,-1)`
     */
    public scale(sx: number, sy?: number, sz?: number) {
        this.m.scale(sx, sy, sz);
        return this;
    }

    /**
     * Apply a transformation from the supplied `Matrix`. see `Matrix.multiply`
     */
    public transform(m) {
        this.m.multiply(m);
        return this;
    }
}
