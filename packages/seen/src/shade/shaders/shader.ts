import { Point, Points } from "../../geometry";

import { Color } from "../color";
import { IRenderData } from "../../render";
import { Light } from "../light";
import { Material } from "../materials";

export interface IShader {
    /**
     * Determines the color of a `Surface` to be painted on screen.
     *
     * - `lights` is an object containing the ambient, point, and directional
     *   light sources.
     * - `renderModel` is an instance of `RenderModel` and contains the
     *   transformed and projected surface data.
     * - `material` is an instance of `Material` and contains the color and
     *   other attributes for determining how light reflects off the surface.
     */
    shade: (lights: Light[], renderModel: IRenderData, material: Material) => Color;
}
