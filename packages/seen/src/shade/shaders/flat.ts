import { Color } from "../color";
import { IRenderData } from "../../render";
import { IShader } from "./shader";
import { Light } from "../light";
import { Material } from "../materials";

/**
 * The `Flat` shader colors surfaces with the material color, disregarding all
 * light sources.
 */
export class Flat implements IShader {
    public shade(lights: Light[], renderModel: IRenderData, material: Material): Color {
        return material.color;
    }
}
