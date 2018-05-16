import { Point } from "../../geometry";
import { Shape } from "../shape";
import { Surface } from "../surface";

/**
 * Accepts a 2-dimensional array of tuples, returns a shape where the tuples
 * represent points of a planar surface.
 */
export function custom(s) {
    const surfaces = [];
    for (let f of s.surfaces) {
        surfaces.push(new Surface(f.map((p) => new Point(...(p || [])))));
    }
    return new Shape("custom", surfaces);
}