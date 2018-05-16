import { Color, Colors } from "./color";

import { Point } from "../geometry";
import { Transformable } from "../transformable";
import { Util } from "../util";

export type LightType = "point" | "directional" | "ambient";
export interface ILightOptions {
    point: Point;
    color: Color;
    intensity: number;
    normal: Point;
    enabled: boolean;
}

/**
 * This model object holds the attributes and transformation of a light source.
 */
export class Light extends Transformable implements ILightOptions {
    public static defaults(): ILightOptions {
        return {
            point: new Point(),
            color: Colors.white(),
            intensity: 0.01,
            normal: new Point(1, -1, -1).normalize(),
            enabled: true,
        };
    }

    public point: Point;
    public color: Color;
    public intensity: number;
    public normal: Point;
    public enabled: boolean;

    private id: string;
    public colorIntensity: Color;

    constructor(public type: LightType, options: Partial<ILightOptions> = {}) {
        super();
        Util.defaults<ILightOptions>(this, options, Light.defaults());
        this.id = Util.uniqueId("l");
    }

    render() {
        return (this.colorIntensity = this.color.copy().scale(this.intensity));
    }
}

export const Lights = {
    /**
     * A point light emits light eminating in all directions from a single
     * point. The `point` property determines the location of the point light.
     * Note, though, that it may also be moved through the transformation of the
     * light.
     */
    point(opts?: Partial<ILightOptions>) {
        return new Light("point", opts);
    },

    /**
     * A directional lights emit light in parallel lines, not eminating from any
     * single point. For these lights, only the `normal` property is used to
     * determine the direction of the light. This may also be transformed.
     */
    directional(opts?: Partial<ILightOptions>) {
        return new Light("directional", opts);
    },

    /**
     * Ambient lights emit a constant amount of light everywhere at once.
     * Transformation of the light has no effect.
     */
    ambient(opts?: Partial<ILightOptions>) {
        return new Light("ambient", opts);
    },
};
