import { CUBE_COORDINATE_MAP } from "./cube";
import { Point } from "../../geometry";
import { Shape } from "../shape";
import { mapPointsToSurfaces } from "../utils";

type ICompositor = (a: number, b: number) => number;

/**
 * Returns an axis-aligned 3D rectangle whose boundaries are defined by the two
 * supplied points.
 */
export function rectangle(point1: Point, point2: Point) {
    const compose = (x: ICompositor, y: ICompositor, z: ICompositor) => {
        return new Point(x(point1.x, point2.x), y(point1.y, point2.y), z(point1.z, point2.z));
    };

    // prettier-ignore
    const points = [
        compose(Math.min, Math.min, Math.min),
        compose(Math.min, Math.min, Math.max),
        compose(Math.min, Math.max, Math.min),
        compose(Math.min, Math.max, Math.max),
        compose(Math.max, Math.min, Math.min),
        compose(Math.max, Math.min, Math.max),
        compose(Math.max, Math.max, Math.min),
        compose(Math.max, Math.max, Math.max)
    ];

    return new Shape("rect", mapPointsToSurfaces(points, CUBE_COORDINATE_MAP));
}