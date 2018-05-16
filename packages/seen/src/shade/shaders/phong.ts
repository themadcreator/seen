import { applyAmbient, applyDiffuseAndSpecular } from "./utils";

import { Color } from "../color";
import { IRenderData } from "../../render";
import { IShader } from "./shader";
import { Light } from "../light";
import { Material } from "../materials";

/**
 * The `Phong` shader implements the Phong shading model with a diffuse,
 * specular, and ambient term.
 *
 * See https://en.wikipedia.org/wiki/Phong_reflection_model for more information
 */
export class Phong implements IShader {
    public shade(lights: Light[], renderModel: IRenderData, material: Material) {
        const c = new Color();

        for (let light of lights) {
            switch (light.type) {
                case "point":
                    var lightNormal = light.point
                        .copy()
                        .subtract(renderModel.barycenter)
                        .normalize();
                    applyDiffuseAndSpecular(c, light, lightNormal, renderModel.normal, material);
                    break;
                case "directional":
                    applyDiffuseAndSpecular(c, light, light.normal, renderModel.normal, material);
                    break;
                case "ambient":
                    applyAmbient(c, light);
                    break;
            }
        }

        c.multiplyChannels(material.color);

        if (material.metallic) {
            c.minChannels(material.specularColor);
        }

        c.clamp(0, 0xff);
        return c;
    }
}