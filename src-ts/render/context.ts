import { RenderLayer, SceneLayer } from "./layers";
import { Scene } from "../scene";
import { Util } from "../util";
import { RenderAnimator } from "../animator";
import { IPathPainter, IRectPainter, ITextPainter, ICirclePainter } from "./painters";

// ## Render Contexts
// ------------------

interface IContextLayer {
  layer: RenderLayer;
  context: IRenderLayerContext;
}

// The `RenderContext` uses `RenderModel`s produced by the scene's render method to paint the shapes into an HTML element.
// Since we support both SVG and Canvas painters, the `RenderContext` and `RenderLayerContext` define a common interface.
export abstract class RenderContext  {
  protected layers: IContextLayer[] = [];

  public render() {
    this.reset();
    for (const { layer, context } of this.layers) {
      context.reset();
      layer.render(context);
      context.cleanup();
    }
    this.cleanup();
    return this;
  }

  // Returns a new `Animator` with this context's render method pre-registered.
  public animate() {
    return new RenderAnimator(this);
  }

  // // Add a new `RenderLayerContext` to this context. This allows us to easily stack paintable components such as
  // // a fill backdrop, or even multiple scenes in one context.
  public abstract layer(layer: RenderLayer);
  //   this.layers.push({
  //     layer,
  //     context : this
  //   });
  //   return this;
  // }

  public sceneLayer(scene: Scene) {
    this.layer(new SceneLayer(scene));
    return this;
  }

  // public abstract path();
  // public abstract rect();
  // public abstract circle();
  // public abstract text();
  public reset() {}
  public cleanup() {}
};

// The `RenderLayerContext` defines the interface for producing painters that can paint various things into the current layer.
export interface IRenderLayerContext {
  path: () => IPathPainter; // Return a path painter
  rect: () => IRectPainter; // Return a rect painter
  circle: () => ICirclePainter; // Return a circle painter
  text: () => ITextPainter; // Return a text painter
  reset: () => void;
  cleanup: () => void;
};
