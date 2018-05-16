import { Point } from "../../geometry";
import { Shape } from "../shape";
import { mapPointsToSurfaces } from "../utils";

/**
 * Map to points in the surfaces of a cube
 */
// prettier-ignore
export const CUBE_COORDINATE_MAP = [
    [0, 1, 3, 2], // left
    [5, 4, 6, 7], // right
    [1, 0, 4, 5], // bottom
    [2, 3, 7, 6], // top
    [3, 1, 5, 7], // front
    [0, 2, 6, 4] // back
];

/**
 * Returns a 2x2x2 cube, centered on the origin.
 */
export function cube() {
    // prettier-ignore
    const points = [
        new Point(-1, -1, -1),
        new Point(-1, -1,  1),
        new Point(-1,  1, -1),
        new Point(-1,  1,  1),
        new Point( 1, -1, -1),
        new Point( 1, -1,  1),
        new Point( 1,  1, -1),
        new Point( 1,  1,  1)
    ];

    return new Shape("cube", mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
}

/**
 * Returns a 1x1x1 cube from the origin to [1, 1, 1].
 */
export function unitcube() {
    // prettier-ignore
    const points = [
        new Point(0, 0, 0),
        new Point(0, 0, 1),
        new Point(0, 1, 0),
        new Point(0, 1, 1),
        new Point(1, 0, 0),
        new Point(1, 0, 1),
        new Point(1, 1, 0),
        new Point(1, 1, 1)
    ];

    return new Shape("unitcube", mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
}
