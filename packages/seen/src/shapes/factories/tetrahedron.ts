import { Point } from "../../geometry";
import { Shape } from "../shape";
import { mapPointsToSurfaces } from "../utils";

/**
 * Map to points in the surfaces of a tetrahedron
 */
// prettier-ignore
const TETRAHEDRON_COORDINATE_MAP = [
    [0, 2, 1],
    [0, 1, 3],
    [3, 2, 0],
    [1, 2, 3]
];

/**
 * Returns a tetrahedron that fits inside a 2x2x2 cube.
 */
export function tetrahedron() {
    // prettier-ignore
    const points = [
        new Point( 1,  1,  1),
        new Point(-1, -1,  1),
        new Point(-1,  1, -1),
        new Point( 1, -1, -1),
    ];

    return new Shape("tetrahedron", mapPointsToSurfaces(points, TETRAHEDRON_COORDINATE_MAP));
}