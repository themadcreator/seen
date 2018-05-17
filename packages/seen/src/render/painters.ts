import { Affine } from "../geometry/affine";
import { IRenderLayerContext } from "./context";
import { ITextSurfaceData } from "..";
import { Point } from "../geometry/point";
import { RenderModel } from "./model";

/**
 * Each `Painter` overrides the paint method. It uses the supplied
 * `IRenderLayerContext`"s builders to create and style the geometry on screen.
 */
export interface IPainter {
    paint: (renderModel: RenderModel, context: IRenderLayerContext) => void;
}

export interface IFillStyle {
    fill?: string | CanvasGradient;
    "fill-opacity"?: number;
}

export interface IStrokeStyle {
    fill?: string;
    stroke?: string;
    "stroke-width"?: number;
}

export interface ITextStyle {
    fill?: string;
    font?: string;
    "text-anchor"?: string;
}

export interface IPaintStyler {
    fill: (style: IFillStyle) => void;
    draw: (style: IStrokeStyle) => void;
}

export interface IPathPainter extends IPaintStyler {
    path: (points: Point[]) => this;
}
export interface IRectPainter extends IPaintStyler {
    rect: (width: number, height: number) => this;
}
export interface ICirclePainter extends IPaintStyler {
    circle: (center: Point, radius: number) => this;
}
export interface ITextPainter {
    fillText: (m: number[], text: string, style: ITextStyle) => this;
}

export class PathPainter implements IPainter {
    paint(renderModel: RenderModel, context: IRenderLayerContext) {
        const painter = context.path().path(renderModel.projected.points);

        if (renderModel.fill != null) {
            painter.fill({
                fill: renderModel.fill == null ? "none" : renderModel.fill.hex(),
                "fill-opacity":
                    (renderModel.fill != null ? renderModel.fill.a : undefined) == null
                        ? 1.0
                        : renderModel.fill.a / 255.0,
            });
        }

        if (renderModel.stroke != null) {
            painter.draw({
                fill: "none",
                stroke: renderModel.stroke == null ? "none" : renderModel.stroke.hex(),
                "stroke-width": renderModel.surface["stroke-width"] != null ? renderModel.surface["stroke-width"] : 1,
            });
        }
    }
}

export class TextPainter implements IPainter {
    paint(renderModel: RenderModel, context: IRenderLayerContext) {
        const data = renderModel.surface.data as ITextSurfaceData;
        const style = {
            fill: renderModel.fill == null ? "none" : renderModel.fill.hex(),
            font: data.font,
            "text-anchor": data.anchor != null ? data.anchor : "middle",
        };
        const xform = Affine.solveForAffineTransform(renderModel.projected.points);
        return context.text().fillText(xform, data.text, style);
    }
}

export const Painters = {
    path: new PathPainter(),
    text: new TextPainter(),
};
