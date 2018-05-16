import { Point } from "../geometry";
import { Shape } from "./shape";
import { Surface } from "./surface";

/**
 * Joins the points into surfaces using the coordinate map, which is an
 * 2-dimensional array of index integers.
 */
export function mapPointsToSurfaces(points: Point[], coordinateMap: number[][]) {
    const surfaces = [];
    for (let coords of coordinateMap) {
        const spts = coords.map((c) => points[c].copy());
        surfaces.push(new Surface(spts));
    }
    return surfaces;
};

/**
 * Accepts an array of 3-tuples and returns an array of 3-tuples representing
 * the triangular subdivision of the surface.
 */
export function subdivideTriangles(triangles: Point[][]) {
    const newTriangles: Array<[Point, Point, Point]> = [];
    for (let tri of triangles) {
        const v01 = tri[0]
            .copy()
            .add(tri[1])
            .normalize();
        const v12 = tri[1]
            .copy()
            .add(tri[2])
            .normalize();
        const v20 = tri[2]
            .copy()
            .add(tri[0])
            .normalize();
        newTriangles.push([tri[0], v01, v20]);
        newTriangles.push([tri[1], v12, v01]);
        newTriangles.push([tri[2], v20, v12]);
        newTriangles.push([v01, v12, v20]);
    }
    return newTriangles;
};

/**
 * Returns a shape that is an extrusion of the supplied points along the offset
 * vector
 */
export function extrude(points: Point[], offset: Point) {
    const surfaces = [];

    // create front and back surfaces
    const front = new Surface(points.map((p) => p.copy()));
    const back = new Surface(points.map((p) => p.copy().add(offset)));

    // create rectangular surfaces between pairs of front/back edges
    for (let i = 1; i < points.length; i++) {
        surfaces.push(
            new Surface([
                front.points[i - 1].copy(),
                back.points[i - 1].copy(),
                back.points[i].copy(),
                front.points[i].copy(),
            ]),
        );
    }

    // wrap final rectanular surface
    const len = points.length;
    surfaces.push(
        new Surface([
            front.points[len - 1].copy(),
            back.points[len - 1].copy(),
            back.points[0].copy(),
            front.points[0].copy(),
        ]),
    );

    // winding rule
    back.points.reverse();
    surfaces.push(front);
    surfaces.push(back);
    return new Shape("extrusion", surfaces);
}
