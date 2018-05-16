import { Point, Quaternion } from "../../geometry";

import { Shape } from "../shape";
import { extrude } from "../utils";

/**
 * Returns a cylinder whose main axis is aligned from point1 to point2
 */
export function cylinder(point1: Point, point2: Point, radius = 1, segments = 8): Shape {
    // Compute a normal perpendicular to the axis point1->point2 and define the
    // rotations about the axis as a quaternion
    const axis = point2.copy().subtract(point1);
    const perp = axis.perpendicular().multiply(radius);
    const theta = -Math.PI * 2.0 / segments;
    const quat = Quaternion.pointAngle(axis.copy().normalize(), theta).toMatrix();

    // Apply the quaternion rotations to create one face
    const points: Point[] = [];
    for (let i = 0; i < segments; i++) {
        const p = point1.copy().add(perp);
        perp.transform(quat);
        points.push(p);
    }

    return extrude(points, axis);
}
