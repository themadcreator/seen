import { Point } from "../geometry/point";
import { IRenderLayerContext, RenderContext } from "./context";
import { Util } from "../util";
import { RenderLayer } from "./layers";
import { Scene } from "../scene";

import {
  IPathPainter,
  IRectPainter,
  ITextPainter,
  ICirclePainter,
  IFillStyle,
  IStrokeStyle,
  ITextStyle
} from "./painters";

// //// HTML5 Canvas Context
// ------------------

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

    for (let i = 0, p = points[i]; i < points.length; i++)
      if (i === 0) {
        this.ctx.moveTo(p.x, p.y);
      } else {
        this.ctx.lineTo(p.x, p.y);
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

export class CanvasCirclePainter extends CanvasStyler
  implements ICirclePainter {
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

export class CanvasRenderContext extends RenderContext {
  private el: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(el: HTMLCanvasElement | string) {
    super();
    this.el = Util.element(el) as HTMLCanvasElement;
    this.ctx = this.el.getContext("2d");
  }

  public layer(layer: RenderLayer) {
    this.layers.push({
      layer: layer,
      context: new CanvasLayerRenderContext(this.ctx)
    });
    return this;
  }

  public reset() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  public cleanup() {}
}

export const CanvasContext = (
  elementId: HTMLCanvasElement | string,
  scene?: Scene
) => {
  const context = new CanvasRenderContext(elementId);
  if (scene != null) {
    context.sceneLayer(scene);
  }
  return context;
};
