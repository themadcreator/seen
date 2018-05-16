import { IMaterializeable } from "../shade";
import { Surface } from "./surface";
import { Transformable } from "../transformable";

/**
 * A `Shape` contains a collection of surface. They may create a closed 3D
 * shape, but not necessarily. For example, a cube is a closed shape, but a
 * patch is not.
 */
export class Shape extends Transformable {
    constructor(public type: string, public surfaces: Surface[]) {
        super();
    }

    /**
     * Visit each surface
     */
    public eachSurface(callback: (surface: Surface, i: number) => void) {
        this.surfaces.forEach(callback);
        return this;
    }

    /**
     * Apply the supplied fill `Material` to each surface
     */
    public fill(fill: IMaterializeable) {
        this.eachSurface((s) => s.fill(fill));
        return this;
    }

    /**
     * Apply the supplied stroke `Material` to each surface
     */
    public stroke(stroke: IMaterializeable) {
        this.eachSurface((s) => s.stroke(stroke));
        return this;
    }
}
