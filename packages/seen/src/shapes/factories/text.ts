import { Affine } from "../../geometry";
import { Painters } from "../../render";
import { Shape } from "../shape";
import { Surface } from "../surface";

/**
 * Return a text surface that can render 3D text using an affine transform
 * estimate of the projection
 */
export function text(text: string, surfaceOptions = {}) {
    const surface = new Surface(Affine.ORTHONORMAL_BASIS(), Painters.text);
    surface.text = text;

    // TODO add types for this
    for (let key in surfaceOptions) {
        const val = surfaceOptions[key];
        surface[key] = val;
    }

    return new Shape("text", [surface]);
}
