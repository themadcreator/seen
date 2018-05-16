import {
    ICirclePainter,
    IFillStyle,
    IPathPainter,
    IRectPainter,
    IStrokeStyle,
    ITextPainter,
    ITextStyle,
} from "./painters";
import { IRenderLayerContext, RenderContext } from "./context";

import { Point } from "../geometry/point";
import { RenderLayer } from "./layers";
import { Scene } from "../scene";
import { Util } from "../util";

export class CanvasStyler {
    constructor(public ctx: CanvasRenderingContext2D) {}

    public draw(style: IStrokeStyle = {}) {
        // Copy over SVG CSS attributes
        if (style.stroke != null) {
            this.ctx.strokeStyle = style.stroke;
        }
        if (style["stroke-width"] != null) {
            this.ctx.lineWidth = style["stroke-width"];
        }
        if (style["text-anchor"] != null) {
            this.ctx.textAlign = style["text-anchor"];
        }
        this.ctx.stroke();
        return this;
    }

    public fill(style: IFillStyle = {}) {
        // Copy over SVG CSS attributes
        if (style.fill != null) {
            this.ctx.fillStyle = style.fill;
        }
        if (style["text-anchor"] != null) {
            this.ctx.textAlign = style["text-anchor"];
        }
        if (style["fill-opacity"] != null) {
            this.ctx.globalAlpha = style["fill-opacity"];
        }

        this.ctx.fill();
        return this;
    }
}

export class CanvasPathPainter extends CanvasStyler implements IPathPainter {
    public path(points: Point[]) {
        this.ctx.beginPath();

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            if (i === 0) {
                this.ctx.moveTo(p.x, p.y);
            } else {
                this.ctx.lineTo(p.x, p.y);
            }
        }

        this.ctx.closePath();
        return this;
    }
}

export class CanvasRectPainter extends CanvasStyler implements IRectPainter {
    public rect(width: number, height: number) {
        this.ctx.rect(0, 0, width, height);
        return this;
    }
}

export class CanvasCirclePainter extends CanvasStyler implements ICirclePainter {
    public circle(center: Point, radius: number) {
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);
        return this;
    }
}

export class CanvasTextPainter implements ITextPainter {
    constructor(public ctx: CanvasRenderingContext2D) {}

    public fillText(m: number[], text: string, style: ITextStyle) {
        this.ctx.save();
        this.ctx.setTransform(m[0], m[3], -m[1], -m[4], m[2], m[5]);

        if (style.font != null) {
            this.ctx.font = style.font;
        }

        if (style.fill != null) {
            this.ctx.fillStyle = style.fill;
        }
        if (style["text-anchor"] != null) {
            this.ctx.textAlign = this._cssToCanvasAnchor(style["text-anchor"]);
        }

        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
        return this;
    }

    private _cssToCanvasAnchor(anchor) {
        return anchor === "middle" ? "center" : anchor;
    }
}

class CanvasLayerRenderContext implements IRenderLayerContext {
    private pathPainter: CanvasPathPainter;
    private ciclePainter: CanvasCirclePainter;
    private textPainter: CanvasTextPainter;
    private rectPainter: CanvasRectPainter;

    constructor(public ctx: CanvasRenderingContext2D) {
        this.pathPainter = new CanvasPathPainter(this.ctx);
        this.ciclePainter = new CanvasCirclePainter(this.ctx);
        this.textPainter = new CanvasTextPainter(this.ctx);
        this.rectPainter = new CanvasRectPainter(this.ctx);
    }

    public path() {
        return this.pathPainter;
    }
    public rect() {
        return this.rectPainter;
    }
    public circle() {
        return this.ciclePainter;
    }
    public text() {
        return this.textPainter;
    }
    public reset() {}

    public cleanup() {}
}

export class CanvasBuffer {
    public static setDpi(
        ctx: CanvasRenderingContext2D,
        screenWidth: number,
        screenHeight: number,
        devicePixelRatioWidth = 1,
        devicePixelRatioHeight = 1,
    ) {
        const { canvas } = ctx;
        // Ideally these next four values should be integers. The `<canvas>`
        // width/height attributes will be automatically floored to integers due
        // to DOM spec and if the style has fractional pixel width/height, it
        // will result in a slightly blurry canvas.
        //
        // See `CanvasBuffer.integerizeSizeAndSetDpi` for more details.
        canvas.width = screenWidth * devicePixelRatioWidth;
        canvas.height = screenHeight * devicePixelRatioHeight;
        canvas.style.width = `${screenWidth}px`;
        canvas.style.height = `${screenHeight}px`;

        // PERF: Apparently .setTransform is MUCH slower that .scale. Im not
        // sure why. We can get away with a save/restore dance instead.
        //
        // ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        ctx.scale(devicePixelRatioWidth, devicePixelRatioHeight);
    }

    public readonly canvas: HTMLCanvasElement;
    public readonly ctx: CanvasRenderingContext2D;
    public dprIntegerWidth: number;
    public dprIntegerHeight: number;

    constructor(public width: number, public height: number, public devicePixelRatio = 2, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d")!;

        // push initial state
        this.ctx.save();
        this.integerizeSizeAndSetDpi(width, height, devicePixelRatio);
    }

    public resize(width: number, height: number, devicePixelRatio = this.devicePixelRatio) {
        // restore initial state
        this.ctx.restore();
        this.ctx.save();
        this.integerizeSizeAndSetDpi(width, height, devicePixelRatio);
    }

    public resizeIfNeeded(width: number, height: number, devicePixelRatio = this.devicePixelRatio) {
        if (this.width !== width || this.height !== height || this.devicePixelRatio !== devicePixelRatio) {
            this.resize(width, height, devicePixelRatio);
        }
    }

    public clear() {
        // PERF: avoid the save/restore and .setTransform, which is apparently very slow.
        this.ctx.clearRect(0, 0, this.canvas.width / this.dprIntegerWidth, this.canvas.height / this.dprIntegerHeight);
    }

    private integerizeSizeAndSetDpi(width: number, height: number, devicePixelRatio: number) {
        // NOTE: We have to floor the values because although style can support
        // fractional width/height, the `<canvas>` element attributes can only
        // be integers.
        this.devicePixelRatio = devicePixelRatio;
        this.dprIntegerWidth = Math.floor(width * devicePixelRatio) / Math.floor(width);
        this.dprIntegerHeight = Math.floor(height * devicePixelRatio) / Math.floor(height);
        this.width = Math.floor(width);
        this.height = Math.floor(height);

        CanvasBuffer.setDpi(this.ctx, this.width, this.height, this.dprIntegerWidth, this.dprIntegerHeight);
    }
}

export class CanvasRenderContext extends RenderContext {
    private el: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private buffer: CanvasBuffer;

    constructor(el: HTMLElement | string) {
        super();
        this.el = Util.element(el) as HTMLCanvasElement;
        this.buffer = new CanvasBuffer(this.el.width, this.el.height, window.devicePixelRatio, this.el);
        this.ctx = this.buffer.ctx;
    }

    public layer(layer: RenderLayer) {
        this.layers.push({
            layer: layer,
            context: new CanvasLayerRenderContext(this.ctx),
        });
        return this;
    }

    public reset() {
        this.buffer.clear();
    }

    public cleanup() {}
}

export const CanvasContext = (elementId: HTMLCanvasElement | string, scene?: Scene) => {
    const context = new CanvasRenderContext(elementId);
    if (scene != null) {
        context.sceneLayer(scene);
    }
    return context;
};
