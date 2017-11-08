import { IRenderLayerContext } from "./context";
import { Affine } from "../geometry/affine";
import { RenderModel } from "./model";

// ## Painters
// #### Surface painters
// ------------------

// Each `Painter` overrides the paint method. It uses the supplied
// `IRenderLayerContext`'s builders to create and style the geometry on screen.
export interface IPainter {
  paint: (renderModel: RenderModel, context: IRenderLayerContext) => void
};

export class PathPainter implements IPainter {
  paint(renderModel: RenderModel, context: IRenderLayerContext) {
    const painter = context.path().path(renderModel.projected.points);

    if (renderModel.fill != null) {
      painter.fill({
        fill           : (renderModel.fill == null) ? 'none' : renderModel.fill.hex(),
        'fill-opacity' : ((renderModel.fill != null ? renderModel.fill.a : undefined) == null) ? 1.0 : (renderModel.fill.a / 255.0)
      });
    }

    if (renderModel.stroke != null) {
      painter.draw({
        fill           : 'none',
        stroke         : (renderModel.stroke == null) ? 'none' : renderModel.stroke.hex(),
        'stroke-width' : renderModel.surface['stroke-width'] != null ? renderModel.surface['stroke-width'] : 1
      });
    }
  }
};

export class TextPainter implements IPainter {
  paint(renderModel: RenderModel, context: IRenderLayerContext) {
    const style = {
      fill          : (renderModel.fill == null) ? 'none' : renderModel.fill.hex(),
      font          : renderModel.surface.font,
      'text-anchor' : renderModel.surface.anchor != null ? renderModel.surface.anchor : 'middle'
    };
    const xform = Affine.solveForAffineTransform(renderModel.projected.points);
    return context.text().fillText(xform, renderModel.surface.text, style);
  }
};

export const Painters = {
  path : new PathPainter(),
  text : new TextPainter(),
};
