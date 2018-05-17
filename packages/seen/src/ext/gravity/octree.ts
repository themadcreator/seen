import { Point } from "../../geometry";

class OctreeCollisionError extends Error {
    public value: any;

    constructor(value: any) {
        super('Collision');
        this.value = value;
    }
}

export class Octree<T, N extends Octree<T, N>> {
    protected internal: boolean = false;
    protected dataPoint: Point;
    public dataValue: T;
    protected children: Array<N>;

    constructor(
        protected order: number = 16,
        protected center: Point = new Point(0, 0, 0),
    ) {
    }

    public get(point: Point) {
        let node: Octree<T, N> = this;
        while (node.internal) {
            node = node.childAt(point);
        }
        return node.dataValue;
    }

    public insert(point: Point, value: T) {
        let node: Octree<T, N> = this;
        while (node.internal) {
            node = node.childAt(point);
        }
        node.insertChild(point, value);
    }

    public nearest(point: Point, best = null) {
        // Return if best is already better than anything in this node
        const halfSize = Math.pow(2, this.order - 1);
        if ((best != null) && (
            (point.x < (this.center.x - halfSize - best.distance)) ||
            (point.x > (this.center.x + halfSize + best.distance)) ||
            (point.y < (this.center.y - halfSize - best.distance)) ||
            (point.y > (this.center.y + halfSize + best.distance)) ||
            (point.z < (this.center.z - halfSize - best.distance)) ||
            (point.z > (this.center.z + halfSize + best.distance))
        )) {
            return best;
        }

        // If we have a value, test ourselves
        if (this.dataPoint != null) {
            const distance = this.dataPoint.distance(point);
            if ((best == null)) {
                best = {
                    distance,
                    point: this.dataPoint,
                    value: this.dataValue
                };
            } else if (distance < best.distance) {
                best = {
                    distance,
                    point: this.dataPoint,
                    value: this.dataValue
                };
            }
        }

        // Finally, recurse children starting at most likely index
        if (this.children != null) {
            const startIndex = this.toChildIndex(point);
            for (let i = 0; i < 8; i++) {
                const idx = (i + startIndex) % 8;
                best = this.children[idx].nearest(point, best);
            }
        }

        return best;
    }

    protected childAt(point: Point): N {
        return this.children[this.toChildIndex(point)];
    }

    private internalize() {
        this.internal = true;
        const quarterSize = Math.pow(2, this.order - 2);

        this.children = new Array(8);
        for (let i = 0; i < 8; i++) {
            this.children[i] = new (this.constructor as any)(
                this.order - 1,
                this.toCenterPoint(i, quarterSize),
            );
        }
    }

    private toCenterPoint(index: number, quarterSize: number) {
        const x = (index & 1) === 0 ? this.center.x - quarterSize : this.center.x + quarterSize;
        const y = (index & 2) === 0 ? this.center.y - quarterSize : this.center.y + quarterSize;
        const z = (index & 4) === 0 ? this.center.z - quarterSize : this.center.z + quarterSize;
        return new Point(x, y, z);
    }

    private toChildIndex(point: Point) {
        const x = point.x < this.center.x ? 0 : 1;
        const y = point.y < this.center.y ? 0 : 1;
        const z = point.z < this.center.z ? 0 : 1;
        return ((z << 2) | (y << 1) | x);
    }

    protected insertChild(point, value: T) {
        // insert here if empty
        if (this.dataPoint == null) {
            this.dataPoint = point;
            this.dataValue = value;
            return;
        }

        // detect direct collisions before attempting to subdivide
        if ((this.dataPoint.x === point.x) &&
            (this.dataPoint.y === point.y) &&
            (this.dataPoint.z === point.z)) {
            throw new OctreeCollisionError(this.dataValue);
        }

        // otherwise we must split!
        // extract current data values
        const currentPoint = this.dataPoint;
        const currentValue = this.dataValue;
        delete this.dataPoint;
        delete this.dataValue;

        this.internalize();

        // re-insert both
        this.childAt(currentPoint).insert(currentPoint, currentValue);
        this.childAt(point).insert(point, value);
    }
}
