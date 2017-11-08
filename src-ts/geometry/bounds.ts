import { Point } from "./point";

// The `Bounds` object contains an axis-aligned bounding box.
export class Bounds {
    public static points(points: Point[]) {
        const box = new Bounds();
        for (let p of points) {
            box.add(p);
        }
        return box;
    }

    public static xywh(x, y, w, h) {
        return Bounds.xyzwhd(x, y, 0, w, h, 0);
    }

    public static xyzwhd(x, y, z, w, h, d) {
        const box = new Bounds();
        box.add(new Point(x, y, z));
        box.add(new Point(x + w, y + h, z + d));
        return box;
    }

    public constructor(private min: Point = null, private max: Point = null) {}

    // Creates a copy of this box object with the same bounds
    public copy() {
        const box = new Bounds();
        box.min = this.min != null ? this.min.copy() : null;
        box.max = this.max != null ? this.max.copy() : null;
        return box;
    }

    // Adds this point to the bounding box, extending it if necessary
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

    // Returns true of this box contains at least one point
    public valid() {
        return this.min != null && this.max != null;
    }

    // Trims this box so that it results in the intersection of this box and the
    // supplied box.
    public intersect(box: Bounds) {
        if (!this.valid() || !box.valid()) {
            this.min = null;
            this.max = null;
        } else {
            this.min = new Point(
                Math.max(this.min.x, box.min.x),
                Math.max(this.min.y, box.min.y),
                Math.max(this.min.z, box.min.z)
            );
            this.max = new Point(
                Math.min(this.max.x, box.max.x),
                Math.min(this.max.y, box.max.y),
                Math.min(this.max.z, box.max.z)
            );

            if (
                this.min.x > this.max.x ||
                this.min.y > this.max.y ||
                this.min.z > this.max.z
            ) {
                this.min = null;
                this.max = null;
            }
        }
        return this;
    }

    // Pads the min and max of this box using the supplied x, y, and z
    public pad(x, y, z) {
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

    // Returns this bounding box to an empty state
    public reset() {
        this.min = null;
        this.max = null;
        return this;
    }

    // Return true iff the point p lies within this bounding box. Points on the
    // edge of the box are included.
    public contains(p) {
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
