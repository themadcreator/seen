import { ICOSAHEDRON_COORDINATE_MAP, ICOSAHEDRON_POINTS } from "./icosahedron";

import { Shape } from "../shape";
import { Surface } from "../surface";
import { subdivideTriangles } from "../utils";

/**
 * Returns a sub-divided icosahedron, which approximates a sphere with triangles
 * of equal size.
 */
export function sphere(subdivisions: number = 2) {
    let triangles = ICOSAHEDRON_COORDINATE_MAP.map((coords) => coords.map((c) => ICOSAHEDRON_POINTS[c]));
    for (let i = 0; i < subdivisions; i++) {
        triangles = subdivideTriangles(triangles);
    }
    return new Shape("sphere", triangles.map((triangle) => new Surface(triangle.map((v) => v.copy()))));
}
