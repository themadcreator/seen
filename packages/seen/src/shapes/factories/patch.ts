import { Point } from "../../geometry";
import { Shape } from "../shape";
import { Surface } from "../surface";

/**
 * Altitude of eqiulateral triangle for computing triangular patch size
 */
export const EQUILATERAL_TRIANGLE_ALTITUDE = Math.sqrt(3.0) / 2.0;

/**
 * Returns a planar triangular patch. The supplied arguments determine the
 * number of triangle in the patch.
 */
export function patch(nx: number = 20, ny: number = 20) {
    nx = Math.round(nx);
    ny = Math.round(ny);
    let surfaces = [];
    for (let x = 0; x < nx; x++) {
        var p, y;
        var asc1, end1;
        const column = [];
        for (y = 0; y < ny; y++) {
            const pts0 = [new Point(x, y), new Point(x + 1, y - 0.5), new Point(x + 1, y + 0.5)];
            const pts1 = [new Point(x, y), new Point(x + 1, y + 0.5), new Point(x, y + 1)];

            for (let pts of [pts0, pts1]) {
                for (p of pts) {
                    p.x *= EQUILATERAL_TRIANGLE_ALTITUDE;
                    p.y += x % 2 === 0 ? 0.5 : 0;
                }
                column.push(pts);
            }
        }

        if (x % 2 !== 0) {
            for (p of column[0]) {
                p.y += ny;
            }
            column.push(column.shift());
        }
        surfaces = surfaces.concat(column);
    }

    return new Shape("patch", surfaces.map((s) => new Surface(s)));
};
