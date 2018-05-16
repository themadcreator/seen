import { Shape } from "../shape";
import { Surface } from "../surface";

/**
 * Returns a shape with a single surface using the supplied points array
 */
export function path(points) {
    return new Shape("path", [new Surface(points)]);
}