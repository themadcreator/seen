import { Point, Points } from "../../geometry";

import { Color } from "../color";
import { Light } from "../light";
import { Material } from "../materials";

const EYE_NORMAL: Point = Points.Z();

/**
 * These shading functions compute the shading for a surface. To reduce code
 * duplication, we aggregate them in a utils object.
 */
export function applyDiffuse(c: Color, light: Light, lightNormal: Point, surfaceNormal: Point, material: Material) {
    const dot = lightNormal.dot(surfaceNormal);

    if (dot > 0) {
        // Apply diffuse phong shading
        return c.addChannels(light.colorIntensity.copy().scale(dot));
    }
}

export function applyDiffuseAndSpecular(c: Color, light: Light, lightNormal: Point, surfaceNormal: Point, material: Material) {
    const dot = lightNormal.dot(surfaceNormal);

    if (dot > 0) {
        // Apply diffuse phong shading
        c.addChannels(light.colorIntensity.copy().scale(dot));

        // Compute and apply specular phong shading
        const reflectionNormal = surfaceNormal
            .copy()
            .multiply(dot * 2)
            .subtract(lightNormal);
        const specularIntensity = Math.pow(0.5 + reflectionNormal.dot(EYE_NORMAL), material.specularExponent);
        const specularColor = material.specularColor.copy().scale(specularIntensity * light.intensity / 255.0);
        return c.addChannels(specularColor);
    }
}

export function applyAmbient(c, light) {
    // Apply ambient shading
    return c.addChannels(light.colorIntensity);
}
