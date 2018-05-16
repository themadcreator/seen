import { applyAmbient, applyDiffuse } from "./utils";

import { Color } from "../color";
import { IRenderData } from "../../render";
import { IShader } from "./shader";
import { Light } from "../light";
import { Material } from "../materials";

/**
 * The `DiffusePhong` shader implements the Phong shading model with a diffuse
 * and ambient term (no specular).
 */
export class DiffusePhong implements IShader {
    public shade(lights: Light[], renderModel: IRenderData, material: Material) {
        const c = new Color();

        for (const light of lights) {
            switch (light.type) {
                case "point":
                    const lightNormal = light.point
                        .copy()
                        .subtract(renderModel.barycenter)
                        .normalize();
                    applyDiffuse(c, light, lightNormal, renderModel.normal, material);
                    break;
                case "directional":
                    applyDiffuse(c, light, light.normal, renderModel.normal, material);
                    break;
                case "ambient":
                    applyAmbient(c, light);
                    break;
            }
        }

        c.multiplyChannels(material.color).clamp(0, 0xff);
        return c;
    }
}
