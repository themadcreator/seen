import { Color } from "../color";
import { IRenderData } from "../../render";
import { IShader } from "./shader";
import { Light } from "../light";
import { Material } from "../materials";
import { applyAmbient } from "./utils";

/**
 * The `Ambient` shader colors surfaces from ambient light only.
 */
export class Ambient implements IShader {
    public shade(lights: Light[], renderModel: IRenderData, material: Material) {
        const c = new Color();

        for (const light of lights) {
            switch (light.type) {
                case "ambient":
                    applyAmbient(c, light);
                    break;
            }
        }

        c.multiplyChannels(material.color).clamp(0, 0xff);
        return c;
    }
}