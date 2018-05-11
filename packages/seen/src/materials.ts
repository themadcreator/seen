import { Color, Colors } from "./color";
import { IShader } from "./shaders";
import { Util } from "./util";
import { Light } from "./light";
import { IRenderData } from "./render/model";

// ## Materials
// #### Surface material properties
// ------------------

export interface IMaterialOptions {
    // The base color of the material.
    color: Color;

    // The `metallic` attribute determines how the specular highlights are
    // calculated. Normally, specular highlights are the color of the light
    // source. If metallic is true, specular highlight colors are determined
    // from the `specularColor` attribute.
    metallic: boolean;

    // The color used for specular highlights when `metallic` is true.
    specularColor: Color;

    // The `specularExponent` determines how "shiny" the material is. A low
    // exponent will create a low-intesity, diffuse specular shine. A high
    // exponent will create an intense, point-like specular shine.
    specularExponent: number;

    // A `Shader` object may be supplied to override the shader used for this
    // material. For example, if you want to apply a flat color to text or
    // other shapes, set this value to `Shaders.Flat`.
    shader: IShader;
}

export type IMaterializeable = Material | Color | string;

// `Material` objects hold the attributes that desribe the color and finish of a surface.
export class Material implements IMaterialOptions {
    public static defaults(): Partial<IMaterialOptions> {
        return {
            metallic: false,
            specularColor: Colors.white(),
            specularExponent: 15,
        };
    }

    public static create(value?: IMaterializeable) {
        if (value instanceof Material) {
            return value;
        } else if (value instanceof Color) {
            return new Material(value);
        } else if (typeof value === "string") {
            return new Material(Colors.parse(value));
        } else {
            return new Material();
        }
    }

    public color: Color;
    public metallic;
    public specularColor;
    public specularExponent;
    public shader: IShader;

    constructor(color: Color = Colors.gray(), options: Partial<IMaterialOptions> = {}) {
        Util.defaults<IMaterialOptions>(this, options, Material.defaults());
        this.color = color;
    }

    // Apply the shader's shading to this material, with the option to override
    // the shader with the material's shader (if defined).
    public render(lights: Light[], shader: IShader, renderData: IRenderData) {
        const renderShader = this.shader != null ? this.shader : shader;
        const color = renderShader.shade(lights, renderData, this);
        color.a = this.color.a;
        return color;
    }
}
