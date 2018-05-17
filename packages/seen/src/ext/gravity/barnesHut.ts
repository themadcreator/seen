import { Octree } from "./octree";
import { Point } from "../../geometry";

export interface IMassive {
    mass: number;
}

export type IBarnesHutNodeVisitor<T extends IMassive> = (node: BarnesHutTree<T>) => void;

interface IBarnesHutCriteriaParameters<T extends IMassive> {
    point: Point;
    theta: number;
    visitor: IBarnesHutNodeVisitor<T>;
}

export class BarnesHutTree<T extends IMassive> extends Octree<T, BarnesHutTree<T>> implements IMassive {
    public mass: number = 0;

    private count: number = 0;
    private size: number;
    private cachedCenterOfMass: Point;
    private centerOfMassSum: Point;

    constructor(order?: number, center?: Point) {
        super(order, center);
        if (order < -4) {
            throw new Error("barnes-hut tree too small, must have order >= -4");
        }
        this.size = (1 << order);
    }

    public insert(point: Point, body: T) {
        let node: BarnesHutTree<T> = this;
        while (node.internal) {
            node.accumulateBody(point, body);
            node = node.childAt(point);
        }

        node.accumulateBody(point, body);
        node.insertChild(point, body);
    }

    private accumulateBody(point: Point, body: T) {
        if (this.cachedCenterOfMass != null) {
            delete this.cachedCenterOfMass;
        }

        const term = point.copy().multiply(body.mass);
        if (this.centerOfMassSum != null) {
            this.centerOfMassSum.add(term);
        } else {
            this.centerOfMassSum = term;
        }

        this.mass += body.mass;
        this.count += 1;
    }

    public centerOfMass() {
        if (this.cachedCenterOfMass == null) {
            this.cachedCenterOfMass = this.centerOfMassSum.copy().multiply(1 / this.mass);
        }
        return this.cachedCenterOfMass;
    }

    public barnesHutCriteria(point: Point, theta: number, visitor: IBarnesHutNodeVisitor<T>) {
        // Storing the args as an object for this highly recursive function
        // improves performance since each stack creates fewer objects.
        return this._barnesHutCriteria({ point, theta, visitor });
    }

    private _barnesHutCriteria(obj: IBarnesHutCriteriaParameters<T>) {
        if (this.count === 0) {
            return;
        }

        if (!this.internal || (this.quotient(this, obj.point) < obj.theta)) {
            obj.visitor(this);
            return;
        }

        if (this.children != null) {
            for (const child of this.children) {
                child._barnesHutCriteria(obj);
            }
            return;
        }
    }

    private quotient(node: BarnesHutTree<T>, point: Point) {
        const ab = node.centerOfMass().copy().subtract(point);
        const dist = Math.sqrt(ab.dot(ab));
        return node.size / dist;
    }
}
