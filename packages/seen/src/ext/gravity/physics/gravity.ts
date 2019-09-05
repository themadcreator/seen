import { P, Point } from "../../../geometry";
import { barnesHutAccumulator, naiveAccumulator } from "./accumulators";

import { CircularQueue } from "../circularQueue";
import { G } from "./constants";
import { IMassive } from "../barnesHut";
import { Shape } from "../../../shapes";
import { Util } from "../../../util";

const DT = 0.5;

function interpolatePoints(a: Point, b: Point, t: number) {
    return new Point(
        (a.x * (1.0 - t)) + (b.x * t),
        (a.y * (1.0 - t)) + (b.y * t),
        (a.z * (1.0 - t)) + (b.z * t),
    )
}

function integratePhysicalMotion(obj: IPhysical, dt: number = DT) {
    // a = f / m
    obj.acceleration = obj.force.copy().divide(obj.mass);

    // p = v * dt + 0.5 * a * dt^2
    obj.position.add(obj.velocity.copy().multiply(dt).add(obj.acceleration.copy().multiply(dt * dt * 0.5)));

    // v = a * dt
    obj.velocity.add(obj.acceleration.copy().multiply(dt));
}

export interface ICollision {
    a: ISphericalBody;
    b: ISphericalBody;
}

export interface IGravitySimulationModel {
    objects: ISphericalBody[];
    collisions: ICollision[];
    barnesHutRatio: number;
    ticks: number;
}

export interface IPhysical extends IMassive {
    force: Point;
    position: Point;
    velocity: Point;
    acceleration: Point;
}

export interface ISphericalBody extends IPhysical {
    radius: number;

    name: string;
    id: number;
    touched: number;
    shape?: Shape;
    collide: (other: ISphericalBody) => ISphericalBody;
}

let INC_ID = 0;

export class Body implements ISphericalBody {
    public name: string;
    public id: number;
    public mass: number;
    public radius: number;
    public position: Point;
    public velocity: Point;
    public force: Point;
    public acceleration: Point;
    public shape: Shape;

    public positionQueue = new CircularQueue(100);
    public touched: number = 0;

    constructor(options: Partial<ISphericalBody> = {}) {
        this.id = INC_ID++;
        Util.defaults<ISphericalBody>(this, options, {
            mass: 10,
            radius: 10,
            position: P(),
            velocity: P(),
            force: P(),
            acceleration: P(),
        });
    }

    public integrate() {
        this.positionQueue.add(this.position.copy());
        this.position.add(this.velocity.copy().multiply(DT).add(this.acceleration.copy().multiply(DT * DT * 0.5)));
        this.velocity.add(this.acceleration.copy().multiply(DT));
    }

    /**
     * Creates a new body that is the result of a collision between this and
     * other. Assuming positions and velocities will combine proportionally to
     * mass. Conserves volume and mass.
     */
    public collide(other: ISphericalBody): ISphericalBody {
        const t = other.mass / (this.mass + other.mass);
        const volumeA = Math.pow(this.radius, 3.0);
        const volumeB = Math.pow(other.radius, 3.0);
        const rNew = Math.pow((volumeA + volumeB), 1 / 3.0);

        return new Body({
            name: this.name + '+' + other.name,
            mass: this.mass + other.mass,
            radius: rNew,
            position: interpolatePoints(this.position, other.position, t),
            // TODO mass weighted sum? must conserve total energy!
            velocity: interpolatePoints(this.velocity, other.velocity, t),
            force: this.force.copy().add(other.force),
            // acceleration: this.acceleration.copy().add(other.acceleration)
        });
    }
}

export type Accumulator = (model: IGravitySimulationModel) => ICollision[];

export class Simulation {
    private accumulator: Accumulator;

    constructor(public model: IGravitySimulationModel) {
        this.accumulator = barnesHutAccumulator;
    }

    public simulate() {
        this.model.ticks += 1;

        this.resetForces();
        const collisions = this.accumulateForces();
        this.model.objects = this.resolveCollisions(collisions);
        this.integrateMotion();
        return collisions;
    }

    private resetForces() {
        for (let i = 0; i < this.model.objects.length; i++) {
            this.model.objects[i].force = P();
        }
    }

    private accumulateForces() {
        return this.accumulator(this.model);
    }

    /**
     *
     *
     * Collide: A + B
     * Index:
     *          A: X
     *          B: X
     *
     * Collide: B + C
     * Index:
     *          A: X
     *          B: X
     *          C: Y
     *          X: Y
     *
     */
    private resolveCollisions(collisions: ICollision[]): ISphericalBody[] {
        const newObjects: Record<string, ISphericalBody> = {};
        const overwrittenIndex: Record<string, number> = {};

        const resolveObject = (obj: ISphericalBody) => {
            let id = obj.id;
            // keep looking up id while we find a mapping in the index
            while(overwrittenIndex[id] != null) {
                id = overwrittenIndex[id];
            }
            // get objects from original collision or new object if already
            // collided
            return newObjects[id] || obj;
        }

        const overwriteObjects = (oldId: number, newId: number) => {
            overwrittenIndex[oldId] = newId;
            // remove invalid "newObject"
            if (newObjects[oldId] != null) {
                delete newObjects[oldId];
            }
        }

        for (const collision of collisions) {
            // resolve actual objects to be collided
            const a = resolveObject(collision.a);
            const b = resolveObject(collision.b);

            // ignore self collision
            if (a === b) { continue; }

            // combine objects in collision
            const c = a.collide(b);

            // overwrite pointers to objects
            overwriteObjects(a.id, c.id);
            overwriteObjects(b.id, c.id);
            newObjects[c.id] = c;
        }

        // build new objects array
        const nextObjects = this.model.objects.filter((obj) => overwrittenIndex[obj.id] == null);
        for (const id of Object.keys(newObjects)) {
            nextObjects.push(newObjects[id]);
        }
        return nextObjects;
    }

    private integrateMotion() {
        for (let i = 0; i < this.model.objects.length; i++) {
            const obj = this.model.objects[i];
            integratePhysicalMotion(obj);
        }
    }
}

export function generateRandomBodies(n: number) {
    const bodies: Body[] = [];

    for (let i = 0; i < n; i++) {
        const mass = Math.random() * 10;
        const massN = n * 3;
        const position = new Point(
            (Math.random() * 800) - 400,
            (Math.random() * 800) - 400,
            (Math.random() * 800) - 400
        );
        const speed = Math.sqrt((G * (mass + massN)) / Math.sqrt(position.dot(position)));
        const velocity = new Point(
            (Math.random() * 10) - 5,
            (Math.random() * 10) - 5,
            (Math.random() * 10) - 5
        );
        velocity.subtract(position.copy().multiply(position.dot(velocity) / position.dot(position)));
        velocity.multiply(speed / Math.sqrt(velocity.dot(velocity)));
        bodies.push(new Body({
            name: `Body-${i}`,
            mass,
            position,
            velocity,
            radius: Math.random() * 20
        }));
    }
    return bodies;
};