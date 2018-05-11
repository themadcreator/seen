import { Material } from "./materials";

// ## Colors
// ------------------

// `Color` objects store RGB and Alpha values from 0 to 255.
export class Color {
    constructor(public r = 0, public g = 0, public b = 0, public a = 0xff) {}

    // Returns a new `Color` object with the same rgb and alpha values as the current object
    public copy() {
        return new Color(this.r, this.g, this.b, this.a);
    }

    // Scales the rgb channels by the supplied scalar value.
    public scale(n) {
        this.r *= n;
        this.g *= n;
        this.b *= n;
        return this;
    }

    // Offsets each rgb channel by the supplied scalar value.
    public offset(n) {
        this.r += n;
        this.g += n;
        this.b += n;
        return this;
    }

    // Clamps each rgb channel to the supplied minimum and maximum scalar values.
    public clamp(min, max) {
        if (min == null) {
            min = 0;
        }
        if (max == null) {
            max = 0xff;
        }
        this.r = Math.min(max, Math.max(min, this.r));
        this.g = Math.min(max, Math.max(min, this.g));
        this.b = Math.min(max, Math.max(min, this.b));
        return this;
    }

    // Takes the minimum between each channel of this `Color` and the supplied `Color` object.
    public minChannels(c) {
        this.r = Math.min(c.r, this.r);
        this.g = Math.min(c.g, this.g);
        this.b = Math.min(c.b, this.b);
        return this;
    }

    // Adds the channels of the current `Color` with each respective channel from the supplied `Color` object.
    public addChannels(c) {
        this.r += c.r;
        this.g += c.g;
        this.b += c.b;
        return this;
    }

    // Multiplies the channels of the current `Color` with each respective channel from the supplied `Color` object.
    public multiplyChannels(c) {
        this.r *= c.r;
        this.g *= c.g;
        this.b *= c.b;
        return this;
    }

    // Converts the `Color` into a hex string of the form "#RRGGBB".
    public hex() {
        let c = ((this.r << 16) | (this.g << 8) | this.b).toString(16);
        while (c.length < 6) {
            c = `0${c}`;
        }
        return `#${c}`;
    }

    // Converts the `Color` into a CSS-style string of the form "rgba(RR, GG, BB, AA)"
    public style() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}

const CSS_RGBA_STRING_REGEX = /rgb(a)?\(([0-9.]+),([0-9.]+),*([0-9.]+)(,([0-9.]+))?\)/;

export const Colors = {
    // Parses a hex string starting with an octothorpe (#) or an rgb/rgba CSS
    // string. Note that the CSS rgba format uses a float value of 0-1.0 for
    // alpha, but seen uses an in from 0-255.
    parse(str) {
        if (str.charAt(0) === "#" && str.length === 7) {
            return Colors.hex(str);
        } else if (str.indexOf("rgb") === 0) {
            const m = CSS_RGBA_STRING_REGEX.exec(str);
            if (m == null) {
                return Colors.black();
            }
            const a = m[6] != null ? Math.round(parseFloat(m[6]) * 0xff) : undefined;
            return new Color(parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4]), a);
        } else {
            return Colors.black();
        }
    },

    // Creates a new `Color` using the supplied rgb and alpha values.
    //
    // Each value must be in the range [0, 255] or, equivalently, [0x00, 0xFF].
    rgb(r, g, b, a): Color {
        return new Color(r, g, b, a);
    },

    // Creates a new `Color` using the supplied hex string of the form "#RRGGBB".
    hex(hex): Color {
        if (hex.charAt(0) === "#") {
            hex = hex.substring(1);
        }
        return new Color(
            parseInt(hex.substring(0, 2), 16),
            parseInt(hex.substring(2, 4), 16),
            parseInt(hex.substring(4, 6), 16),
        );
    },

    // Creates a new `Color` using the supplied hue, saturation, and lightness
    // (HSL) values.
    //
    // Each value must be in the range [0.0, 1.0].
    hsl(h, s = 0.5, l = 0.4, a = 1): Color {
        let b, g;
        if (a == null) {
            a = 1;
        }
        let r = (g = b = 0);
        if (s === 0) {
            // When saturation is 0, the color is "achromatic" or "grayscale".
            r = g = b = l;
        } else {
            const hue2rgb = function(p, q, t) {
                if (t < 0) {
                    t += 1;
                } else if (t > 1) {
                    t -= 1;
                }

                if (t < 1 / 6) {
                    return p + (q - p) * 6 * t;
                } else if (t < 1 / 2) {
                    return q;
                } else if (t < 2 / 3) {
                    return p + (q - p) * (2 / 3 - t) * 6;
                } else {
                    return p;
                }
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return new Color(r * 255, g * 255, b * 255, a * 255);
    },

    // Generates a new random color for each surface of the supplied `Shape`.
    randomSurfaces(shape, sat?: number, lit?: number) {
        return shape.surfaces.map((surface) => surface.fill(Colors.hsl(Math.random(), sat, lit)));
    },

    // Generates a random hue then randomly drifts the hue for each surface of
    // the supplied `Shape`.
    randomSurfaces2(shape, drift = 0.03, sat?: number, lit?: number) {
        let hue = Math.random();
        return (() => {
            const result = [];
            for (let surface of shape.surfaces) {
                hue += (Math.random() - 0.5) * drift;
                while (hue < 0) {
                    hue += 1;
                }
                while (hue > 1) {
                    hue -= 1;
                }
                result.push(surface.fill(Colors.hsl(hue, 0.5, 0.4)));
            }
            return result;
        })();
    },

    // Generates a random color then sets the fill for every surface of the
    // supplied `Shape`.
    randomShape(shape, sat?: number, lit?: number) {
        return shape.fill(new Material(Colors.hsl(Math.random(), sat, lit)));
    },

    // A few `Color`s are supplied for convenience.
    black() {
        return this.hex("#000000");
    },
    white() {
        return this.hex("#FFFFFF");
    },
    gray() {
        return this.hex("#888888");
    },
};

// Convenience `Color` constructor.
export const C = (r?: number, g?: number, b?: number, a?: number) => new Color(r, g, b, a);
