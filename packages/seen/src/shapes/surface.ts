import { Colors, IMaterializeable, Material } from "../shade";
import { IPainter, Painters } from "../render/painters";

import { Point } from "../geometry";
import { Transformable } from "../transformable";
import { Util } from "../util";

/**
 * A `Surface` is a defined as a planar object in 3D space. These paths don't
 * necessarily need to be convex, but they should be non-degenerate. This
 * library does not support shapes with holes.
 */
export class Surface {
    /**
     * When 'false' this will override backface culling, which is useful if your
     * material is transparent. See comment in `seen.Scene`.
     */
    public cullBackfaces = true;

    /**
     * Fill and stroke may be `Material` objects, which define the color and
     * finish of the object and are rendered using the scene's shader.
     */
    public fillMaterial = new Material(Colors.gray());
    public strokeMaterial = null;
    public dirty = false;

    public text: string;
    public id: string;

    public font: string;
    public anchor: string;

    constructor(public points: Point[], public painter: IPainter = Painters.path) {
        // We store a unique id for every surface so we can look them up quickly
        // with the `renderModel` cache.
        this.id = Util.uniqueId("s");
    }

    public fill(fill: IMaterializeable) {
        this.fillMaterial = Material.create(fill);
        return this;
    }

    public stroke(stroke: IMaterializeable) {
        this.strokeMaterial = Material.create(stroke);
        return this;
    }
}
