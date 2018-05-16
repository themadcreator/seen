import { Point } from "../../geometry";
import { Shape } from "../shape";
import { mapPointsToSurfaces } from "../utils";

/**
 * Map to points in the surfaces of a rectangular pyramid
 */
// prettier-ignore
const PYRAMID_COORDINATE_MAP = [
    [1, 0, 2, 3], // bottom
    [0, 1, 4], // left
    [2, 0, 4], // rear
    [3, 2, 4], // right
    [1, 3, 4] // front
];

/**
 * Returns a square pyramid inside a unit cube
 */
export function pyramid() {
    // prettier-ignore
    const points = [
        new Point(0, 0, 0),
        new Point(0, 0, 1),
        new Point(1, 0, 0),
        new Point(1, 0, 1),
        new Point(0.5, 1, 0.5)
    ];

    return new Shape("pyramid", mapPointsToSurfaces(points, PYRAMID_COORDINATE_MAP));
}