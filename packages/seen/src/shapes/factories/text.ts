import { ITextSurfaceData, TextSurface } from "../surface";

import { Affine } from "../../geometry";
import { Painters } from "../../render";
import { Shape } from "../shape";
import { Util } from "../../util";

/**
 * Return a text surface that can render 3D text using an affine transform
 * estimate of the projection
 */
export function text(text: string, surfaceOptions: Partial<ITextSurfaceData> = {}) {
    const surface = new TextSurface(Affine.ORTHONORMAL_BASIS(), Painters.text);
    surface.data = Util.defaults<ITextSurfaceData>({ text }, {}, surfaceOptions);
    return new Shape("text", [surface]);
}
