import { Matrix } from "./matrix";
import { Point, Points } from "./point";

// A Quaterionion class for computing quaterion multiplications. This creates
// more natural mouse rotations.
//
// Attribution: adapted from http://glprogramming.com/codedump/godecho/quaternion.html
export class Quaternion {
    public static pixelsPerRadian = 150;

    // Convert the x and y pixel offsets into a rotation matrix
    public static xyToTransform(x: number, y: number) {
        const quatX = Quaternion.pointAngle(Points.Y(), x / Quaternion.pixelsPerRadian);
        const quatY = Quaternion.pointAngle(Points.X(), y / Quaternion.pixelsPerRadian);
        return quatX.multiply(quatY).toMatrix();
    }

    // Create a rotation matrix from the axis defined by x, y, and z values, and the supplied angle.
    public static axisAngle(x: number, y: number, z: number, angleRads: number) {
        const scale = Math.sin(angleRads / 2.0);
        const w = Math.cos(angleRads / 2.0);
        return new Quaternion(scale * x, scale * y, scale * z, w);
    }

    // Create a rotation matrix from the axis defined by the supplied point and the supplied angle.
    public static pointAngle(p, angleRads) {
        const scale = Math.sin(angleRads / 2.0);
        const w = Math.cos(angleRads / 2.0);
        return new Quaternion(scale * p.x, scale * p.y, scale * p.z, w);
    }

    private q: Point;

    constructor(x?: number, y?: number, z?: number, w?: number) {
        this.q = new Point(x, y, z, w);
    }

    // Multiply this `Quaterionion` by the `Quaternion` argument.
    public multiply(q) {
        const r = new Point();

        r.w = this.q.w * q.q.w - this.q.x * q.q.x - this.q.y * q.q.y - this.q.z * q.q.z;
        r.x = this.q.w * q.q.x + this.q.x * q.q.w + this.q.y * q.q.z - this.q.z * q.q.y;
        r.y = this.q.w * q.q.y + this.q.y * q.q.w + this.q.z * q.q.x - this.q.x * q.q.z;
        r.z = this.q.w * q.q.z + this.q.z * q.q.w + this.q.x * q.q.y - this.q.y * q.q.x;

        const result = new Quaternion();
        result.q = r;
        return result;
    }

    // Convert this `Quaterion` into a transformation matrix.
    public toMatrix() {
        const m = new Array(16);

        m[0] = 1.0 - 2.0 * (this.q.y * this.q.y + this.q.z * this.q.z);
        m[1] = 2.0 * (this.q.x * this.q.y - this.q.w * this.q.z);
        m[2] = 2.0 * (this.q.x * this.q.z + this.q.w * this.q.y);
        m[3] = 0.0;

        m[4] = 2.0 * (this.q.x * this.q.y + this.q.w * this.q.z);
        m[5] = 1.0 - 2.0 * (this.q.x * this.q.x + this.q.z * this.q.z);
        m[6] = 2.0 * (this.q.y * this.q.z - this.q.w * this.q.x);
        m[7] = 0.0;

        m[8] = 2.0 * (this.q.x * this.q.z - this.q.w * this.q.y);
        m[9] = 2.0 * (this.q.y * this.q.z + this.q.w * this.q.x);
        m[10] = 1.0 - 2.0 * (this.q.x * this.q.x + this.q.y * this.q.y);
        m[11] = 0.0;

        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1.0;

        return new Matrix(m);
    }
}
