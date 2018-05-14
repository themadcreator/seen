import { Point } from "./point";

/**
 * An axis-aligned bounding box.
 */
export class Bounds {
    public static points(points: Point[]) {
        const box = new Bounds();
        for (let p of points) {
            box.add(p);
        }
        return box;
    }

    public static xywh(x: number, y: number, w: number, h: number) {
        return Bounds.xyzwhd(x, y, 0, w, h, 0);
    }

    public static xyzwhd(x: number, y: number, z: number, w: number, h: number, d: number) {
        const box = new Bounds();
        box.add(new Point(x, y, z));
        box.add(new Point(x + w, y + h, z + d));
        return box;
    }

    public constructor(private min: Point = null, private max: Point = null) {}

    /**
     * Creates a copy of this box object with the same bounds
     */
    public copy() {
        const box = new Bounds();
        box.min = this.min != null ? this.min.copy() : null;
        box.max = this.max != null ? this.max.copy() : null;
        return box;
    }

    /**
     * Adds this point to the bounding box, extending it if necessary
     */
    public add(p: Point) {
        if (!(this.min != null && this.max != null)) {
            this.min = p.copy();
            this.max = p.copy();
        } else {
            this.min.x = Math.min(this.min.x, p.x);
            this.min.y = Math.min(this.min.y, p.y);
            this.min.z = Math.min(this.min.z, p.z);

            this.max.x = Math.max(this.max.x, p.x);
            this.max.y = Math.max(this.max.y, p.y);
            this.max.z = Math.max(this.max.z, p.z);
        }
        return this;
    }

    /**
     * Returns true of this box contains at least one point
     */
    public valid() {
        return this.min != null && this.max != null;
    }

    /**
     * Trims this box so that it results in the intersection of this box and the
     * supplied box.
     */
    public intersect(box: Bounds) {
        if (!this.valid() || !box.valid()) {
            this.min = null;
            this.max = null;
        } else {
            this.min = new Point(
                Math.max(this.min.x, box.min.x),
                Math.max(this.min.y, box.min.y),
                Math.max(this.min.z, box.min.z),
            );
            this.max = new Point(
                Math.min(this.max.x, box.max.x),
                Math.min(this.max.y, box.max.y),
                Math.min(this.max.z, box.max.z),
            );

            if (this.min.x > this.max.x || this.min.y > this.max.y || this.min.z > this.max.z) {
                this.min = null;
                this.max = null;
            }
        }
        return this;
    }

    /**
     * Pads the min and max of this box using the supplied x, y, and z
     */
    public pad(x: number, y: number, z: number) {
        if (this.valid()) {
            if (y == null) {
                y = x;
            }
            if (z == null) {
                z = y;
            }
            const p = new Point(x, y, z);
            this.min.subtract(p);
            this.max.add(p);
        }
        return this;
    }

    /**
     * Returns this bounding box to an empty state
     */
    public reset() {
        this.min = null;
        this.max = null;
        return this;
    }

    // Do everything we can to avoid copying points because object creation is
    // slow
    public resetTo(points: Point[]) {
        if (points.length === 0) {
            this.reset();
            return;
        }

        const p0 = points[0];

        if (this.min == null) {
            this.min = p0.copy();
        } else {
            this.min.set(p0);
        }

        if (this.max == null) {
            this.max = p0.copy();
        } else {
            this.max.set(p0);
        }

        for (let i = 1; i < points.length; i++) {
            this.add(points[i]);
        }
    }

    // Return true iff the point p lies within this bounding box. Points on the
    // edge of the box are included.
    public contains(p: Point) {
        if (!this.valid()) {
            return false;
        } else if (this.min.x > p.x || this.max.x < p.x) {
            return false;
        } else if (this.min.y > p.y || this.max.y < p.y) {
            return false;
        } else if (this.min.z > p.z || this.max.z < p.z) {
            return false;
        } else {
            return true;
        }
    }

    // Returns the center of the box or zero if no points are in the box
    public center() {
        return new Point(
            this.minX() + this.width() / 2,
            this.minY() + this.height() / 2,
            this.minZ() + this.depth() / 2,
        );
    }

    // Returns the width (x extent) of the box
    public width() {
        return this.maxX() - this.minX();
    }

    // Returns the height (y extent) of the box
    public height() {
        return this.maxY() - this.minY();
    }

    // Returns the depth (z extent) of the box
    public depth() {
        return this.maxZ() - this.minZ();
    }

    public minX() {
        return this.min != null ? this.min.x : 0;
    }

    public minY() {
        return this.min != null ? this.min.y : 0;
    }

    public minZ() {
        return this.min != null ? this.min.z : 0;
    }

    public maxX() {
        return this.max != null ? this.max.z : 0;
    }

    public maxY() {
        return this.max != null ? this.max.z : 0;
    }

    public maxZ() {
        return this.max != null ? this.max.z : 0;
    }
}
