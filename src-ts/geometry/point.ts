import { Matrix } from "./matrix";

// The `Point` object contains x,y,z, and w coordinates. `Point`s support
// various arithmetic operations with other `Points`, scalars, or `Matrices`.
//
// Most of the methods on `Point` are destructive, so be sure to use `.copy()`
// when you want to preserve an object's value.
export class Point {
  constructor(public x = 0, public y = 0, public z = 0, public w = 0) {}

  // Creates and returns a new `Point` with the same values as this object.
  public copy() {
    return new Point(this.x, this.y, this.z, this.w);
  }

  // Copies the values of the supplied `Point` into this object.
  public set(p: Point) {
    this.x = p.x;
    this.y = p.y;
    this.z = p.z;
    this.w = p.w;
    return this;
  }

  // Performs parameter-wise addition with the supplied `Point`. Excludes `@w`.
  public add(q: Point) {
    this.x += q.x;
    this.y += q.y;
    this.z += q.z;
    return this;
  }

  // Performs parameter-wise subtraction with the supplied `Point`. Excludes `@w`.
  public subtract(q: Point) {
    this.x -= q.x;
    this.y -= q.y;
    this.z -= q.z;
    return this;
  }

  // Apply a translation.  Excludes `@w`.
  public translate(x = 0, y = 0, z = 0) {
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
  }

  // Multiplies each parameters by the supplied scalar value. Excludes `@w`.
  public multiply(n = 1) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
    return this;
  }

  // Divides each parameters by the supplied scalar value. Excludes `@w`.
  public divide(n = 1) {
    this.x /= n;
    this.y /= n;
    this.z /= n;
    return this;
  }

  // Rounds each coordinate to the nearest integer. Excludes `@w`.
  public round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }

  // Truncates decimal each coordinate to the nearest integer. Excludes `@w`.
  public fix(digits = 2) {
    this.x = parseFloat(this.x.toFixed(digits));
    this.y = parseFloat(this.y.toFixed(digits));
    this.z = parseFloat(this.z.toFixed(digits));
    return this;
  }

  // Divides this `Point` by its magnitude. If the point is (0,0,0) we return (0,0,1).
  public normalize() {
    const n = this.magnitude();
    if (n === 0) {
      // Strict zero comparison -- may be worth using an epsilon
      this.set(Points.Z());
    } else {
      this.divide(n);
    }
    return this;
  }

  // Returns a new point that is perpendicular to this point
  perpendicular() {
    const n = this.copy().cross(Points.Z());
    const mag = n.magnitude();
    if (mag !== 0) {
      return n.divide(mag);
    }
    return this.copy()
      .cross(Points.X())
      .normalize();
  }

  // Apply a transformation from the supplied `Matrix`.
  transform(matrix: Matrix) {
    const r = POINT_POOL;
    r.x =
      this.x * matrix.m[0] +
      this.y * matrix.m[1] +
      this.z * matrix.m[2] +
      this.w * matrix.m[3];
    r.y =
      this.x * matrix.m[4] +
      this.y * matrix.m[5] +
      this.z * matrix.m[6] +
      this.w * matrix.m[7];
    r.z =
      this.x * matrix.m[8] +
      this.y * matrix.m[9] +
      this.z * matrix.m[10] +
      this.w * matrix.m[11];
    r.w =
      this.x * matrix.m[12] +
      this.y * matrix.m[13] +
      this.z * matrix.m[14] +
      this.w * matrix.m[15];

    this.set(r);
    return this;
  }

  // Returns this `Point`s magnitude squared. Excludes `@w`.
  magnitudeSquared() {
    return this.dot(this);
  }

  // Returns this `Point`s magnitude. Excludes `@w`.
  magnitude() {
    return Math.sqrt(this.magnitudeSquared());
  }

  // Computes the dot product with the supplied `Point`.
  dot(q: Point) {
    return this.x * q.x + this.y * q.y + this.z * q.z;
  }

  // Computes the cross product with the supplied `Point`.
  cross(q: Point) {
    const r = POINT_POOL;
    r.x = this.y * q.z - this.z * q.y;
    r.y = this.z * q.x - this.x * q.z;
    r.z = this.x * q.y - this.y * q.x;

    this.set(r);
    return this;
  }
}

// Convenience method for creating `Points`.
export const P = (x?: number, y?: number, z?: number, w?: number) => {
  return new Point(x, y, z, w);
}

// A pool object which prevents us from having to create new `Point` objects
// for various calculations, which vastly improves performance.
const POINT_POOL = new Point();

// A few useful `Point` objects. Be sure that you don't invoke destructive
// methods on these objects.
export const Points = {
  X() {
    return P(1, 0, 0);
  },
  Y() {
    return P(0, 1, 0);
  },
  Z() {
    return P(0, 0, 1);
  },
  ZERO() {
    return P(0, 0, 0);
  }
};
