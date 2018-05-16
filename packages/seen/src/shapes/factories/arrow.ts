import { Point } from "../../geometry";
import { Shape } from "../shape";
import { extrude } from "../utils";

/**
 * Returns an extruded block arrow shape.
 */
export function arrow(
    thickness: number = 1,
    tailLength: number = 1,
    tailWidth: number = 1,
    headLength: number = 1,
    headPointiness: number = 0
): Shape {
    const htw = tailWidth / 2;
    // prettier-ignore
    const points = [
        new Point(0, 0, 0),
        new Point(headLength + headPointiness, 1, 0),
        new Point(headLength, htw, 0),
        new Point(headLength + tailLength, htw, 0),
        new Point(headLength + tailLength, -htw, 0),
        new Point(headLength, -htw, 0),
        new Point(headLength + headPointiness, -1, 0)
    ];
    return extrude(points, new Point(0, 0, thickness));
}