import { Point } from "../../geometry";
import { Shape } from "../shape";
import { mapPointsToSurfaces } from "../utils";

const ICOS_X = 0.525731112119133606;
const ICOS_Z = 0.850650808352039932;

/**
 * Points array of an icosahedron
 */
// prettier-ignore
export const ICOSAHEDRON_POINTS = [
    new Point(-ICOS_X, 0.0,     -ICOS_Z),
    new Point(ICOS_X,  0.0,     -ICOS_Z),
    new Point(-ICOS_X, 0.0,     ICOS_Z),
    new Point(ICOS_X,  0.0,     ICOS_Z),
    new Point(0.0,     ICOS_Z,  -ICOS_X),
    new Point(0.0,     ICOS_Z,  ICOS_X),
    new Point(0.0,     -ICOS_Z, -ICOS_X),
    new Point(0.0,     -ICOS_Z, ICOS_X),
    new Point(ICOS_Z,  ICOS_X,  0.0),
    new Point(-ICOS_Z, ICOS_X,  0.0),
    new Point(ICOS_Z,  -ICOS_X, 0.0),
    new Point(-ICOS_Z, -ICOS_X, 0.0)
];

/**
 * Map to points in the surfaces of an icosahedron
 */
// prettier-ignore
export const ICOSAHEDRON_COORDINATE_MAP = [
    [0, 4, 1],
    [0, 9, 4],
    [9, 5, 4],
    [4, 5, 8],
    [4, 8, 1],
    [8, 10, 1],
    [8, 3, 10],
    [5, 3, 8],
    [5, 2, 3],
    [2, 7, 3],
    [7, 10, 3],
    [7, 6, 10],
    [7, 11, 6],
    [11, 0, 6],
    [0, 1, 6],
    [6, 1, 10],
    [9, 0, 11],
    [9, 11, 2],
    [9, 2, 5],
    [7, 2, 11]
];


/**
 * Returns an icosahedron that fits within a 2x2x2 cube, centered on the
 * origin.
 */
export function icosahedron() {
    return new Shape("icosahedron", mapPointsToSurfaces(ICOSAHEDRON_POINTS, ICOSAHEDRON_COORDINATE_MAP));
}