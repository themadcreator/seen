import { Model } from "./model"
import { Camera, Viewports } from "./camera";
import { IShader, Shaders } from "./shaders";
import { Matrix } from "./geometry/matrix";
import { Util } from "./util";
import { LightRenderModel, RenderModel } from "./render/model";

// ## Scene
// ------------------

export interface ISceneOptions {
  // The root model for the scene, which contains `Shape`s, `Light`s, and
  // other `Model`s
    model : Model;

    // The `Camera`, which defines the projection transformation. The default
    // projection is perspective.
    camera:  Camera;

    // The `Viewport`, which defines the projection from shape-space to
    // projection-space then to screen-space. The default viewport is on a
    // space from (0,0,0) to (1,1,1). To map more naturally to pixels, create a
    // viewport with the same width/height as the DOM element.
    viewport : {prescale: Matrix, postscale: Matrix },

    // The scene's shader determines which lighting model is used.
    shader : IShader,

    // The `cullBackfaces` boolean can be used to turn off backface-culling
    // for the whole scene. Beware, turning this off can slow down a scene's
    // rendering by a factor of 2. You can also turn off backface-culling for
    // individual surfaces with a boolean on those objects.
    cullBackfaces: boolean,

    // The `fractionalPoints` boolean determines if we round the surface
    // coordinates to the nearest integer. Rounding the coordinates before
    // display speeds up path drawing  especially when using an SVG context
    // since it cuts down on the length of path data. Anecdotally, my speedup
    // on a complex demo scene was 10 FPS. However, it does introduce a slight
    // jittering effect when animating.
    fractionalPoints : boolean,

    // The `cache` boolean (default : true) enables a simple cache for
    // renderModels, which are generated for each surface in the scene. The
    // cache is a simple Object keyed by the surface's unique id. The cache has
    // no eviction policy. To flush the cache, call `.flushCache()`
    cache            : boolean,
}

// A `Scene` is the main object for a view of a scene.
export class Scene implements ISceneOptions {
  public model            = new Model();

  public  camera           = new Camera();

  public  viewport         = Viewports.origin(1, 1);

  public   shader           = Shaders.phong();

  public   cullBackfaces    = true;
  public   fractionalPoints = false;
      public   cache            = true;


  private _renderModelCache = {};

  constructor(options: Partial<ISceneOptions> = {}) {
    Util.defaults<ISceneOptions>(this, options);
  }

  // The primary method that produces the render models, which are then used
  // by the `RenderContext` to paint the scene.
  public render() {
    // Compute the projection matrix including the viewport and camera
    // transformation matrices.
    const projection = this.camera.m.copy()
      .multiply(this.viewport.prescale)
      .multiply(this.camera.projection);
    const viewport   = this.viewport.postscale;

    const renderModels = [];
    this.model.eachRenderable(
      (light, transform) =>
        // Compute light model data.
        new LightRenderModel(light, transform)
      ,

      (shape, lights, transform) => {
        return (() => {
          const result = [];
          for (let surface of shape.surfaces) {
          // Compute transformed and projected geometry.
            const renderModel = this._renderSurface(surface, transform, projection, viewport);

            // Test projected normal's z-coordinate for culling (if enabled).
            if ((!this.cullBackfaces || !surface.cullBackfaces || (renderModel.projected.normal.z < 0)) && renderModel.inFrustrum) {
              // Render fill and stroke using material and shader.
              renderModel.fill   = surface.fillMaterial != null ? surface.fillMaterial.render(lights, this.shader, renderModel.transformed) : undefined;
              renderModel.stroke = surface.strokeMaterial != null ? surface.strokeMaterial.render(lights, this.shader, renderModel.transformed) : undefined;

              // Round coordinates (if enabled)
              if (this.fractionalPoints !== true) {
                for (let p of renderModel.projected.points) {
                  p.round();
                }
              }

              result.push(renderModels.push(renderModel));
            } else {
              result.push(undefined);
            }
          }
          return result;
        })();
    });

    // Sort render models by projected z coordinate. This ensures that the surfaces
    // farthest from the eye are painted first. (Painter's Algorithm)
    renderModels.sort((a, b) => b.projected.barycenter.z - a.projected.barycenter.z);

    return renderModels;
  }

  // Get or create the rendermodel for the given surface. If `@cache` is true, we cache these models
  // to reduce object creation and recomputation.
  _renderSurface(surface, transform, projection, viewport) {
    if (!this.cache) {
      return new RenderModel(surface, transform, projection, viewport);
    }

    let renderModel = this._renderModelCache[surface.id];
    if ((renderModel == null)) {
      renderModel = (this._renderModelCache[surface.id] = new RenderModel(surface, transform, projection, viewport));
    } else {
      renderModel.update(transform, projection, viewport);
    }
    return renderModel;
  }

  // Removes all elements from the cache. This may be necessary if you add and
  // remove many shapes from the scene's models since this cache has no
  // eviction policy.
  flushCache() {
    return this._renderModelCache = {};
  }
};

