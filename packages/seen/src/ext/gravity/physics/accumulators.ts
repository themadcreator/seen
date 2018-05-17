import { ICollision, IGravitySimulationModel, ISphericalBody } from "./gravity";

import { BarnesHutTree } from "../barnesHut";
import { G } from "./constants";
import { Point } from "../../../geometry";

export function naiveAccumulator(model: IGravitySimulationModel) {
    const collisions: ICollision[] = [];
    for (let ai = 0; ai < model.objects.length; ai++) {
        const a = model.objects[ai];

        for (let bi = 0; bi < model.objects.length; bi++) {
            const b = model.objects[bi];
            if (!(bi > ai)) { continue; }

            const ab = a.position.copy().subtract(b.position);
            const force = (G * a.mass * b.mass) / ab.dot(ab);
            const dist = Math.sqrt(ab.dot(ab));
            const forceScale = force / dist;
            a.force.add(ab.copy().multiply(-forceScale));
            b.force.add(ab.copy().multiply(forceScale));

            if (model.collisions && (dist < (a.radius + b.radius))) {
                collisions.push({ a, b });
            }
        }
    }
    return collisions;
};

const barnesHutTheta = 1e-2;
export function barnesHutAccumulator(model: IGravitySimulationModel) {

    const collisions: ICollision[] = [];
    const tree = new BarnesHutTree<ISphericalBody>();

    // reset body touch count and build octree
    for (let bi = 0; bi < model.objects.length; bi++) {
        const body = model.objects[bi];
        body.touched = 0;
        tree.insert(body.position, body);
    }

    for (let bi = 0; bi < model.objects.length; bi++) {
        const body = model.objects[bi];

        // visit gravitational fields that enact forces on `body`
        tree.barnesHutCriteria(body.position, barnesHutTheta, (node) => {
            // skip self
            const nodeBody = node.dataValue;
            if (nodeBody === body) { return; }

            body.touched += 1;

            // accumulate forces on body
            const ab = body.position.copy().subtract(node.centerOfMass());
            const force = (G * node.mass * body.mass) / ab.dot(ab);
            const dist = Math.sqrt(ab.dot(ab));
            const forceScale = force / dist;
            body.force.add(ab.copy().multiply(-forceScale));

            // collide if close enough
            if (nodeBody != null && (dist < (nodeBody.radius + body.radius))) {
                collisions.push({
                    a: body,
                    b: nodeBody,
                });
            }
        })
    }

    // estimate speedup efficiency
    let totalTouched = 0;
    for (let bi = 0; bi < model.objects.length; bi++) {
        const body = model.objects[bi];
        totalTouched += body.touched;
    }
    model.barnesHutRatio = 1.0 - (totalTouched / (model.objects.length * (model.objects.length - 1)));

    return collisions;
}