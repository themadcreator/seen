# ## Scene
# ------------------

# A `Scene` is the main object for a view of a scene.
class seen.Scene
  defaults:
    # The root model for the scene, which contains `Shape`s, `Light`s, and other `Model`s
    model            : new seen.Model()
    # The `Camera`, which defines the projection from shape-space to screen-space.
    camera           : new seen.Camera()
    # The scene's shader determines which lighting model is used.
    shader           : seen.Shaders.phong

    # The `cullBackfaces` boolean can be used to turn off backface-culling
    # for the whole scene. Beware, turning this off can slow down a scene's
    # rendering by a factor of 2. You can also turn off backface-culling for
    # individual surfaces with a boolean on those objects.
    cullBackfaces    : true

    # The `fractionalPoints` boolean determines if we round the surface
    # coordinates to the nearest integer. Rounding the coordinates before
    # display speeds up path drawing at the cost of a slight jittering effect
    # when animating especially when using an SVG context since it cuts down
    # on the length of path data. Anecdotally, my speedup on a complex demo
    # scene was 10 FPS.
    fractionalPoints : false

    # The `cache` boolean (default : true) enables a simple cache for
    # renderModels, which are generated for each surface in the scene. The
    # cache is a simple Object keyed by the surface's unique id. The cache has
    # no eviction policy. To flush the cache, call `.flushCache()`
    cache            : true

  constructor: (options) ->
    seen.Util.defaults(@, options, @defaults)
    @_renderModelCache = {}

  # The primary method that produces the render models, which are then used
  # by the `RenderContext` to paint the scene.
  render : () =>
    # Compute the projection matrix.
    projection = @camera.getMatrix()

    renderModels = []
    @model.eachRenderable(
      (light, transform) ->
        # Compute light model data.
        new seen.LightRenderModel(light, transform)

      (shape, lights, transform) =>
        for surface in shape.surfaces
          # Compute transformed and projected geometry.
          renderModel = @_renderSurface(surface, transform, projection)

          # Test projected normal's z-coordinate for culling (if enabled).
          if (not @cullBackfaces or not surface.cullBackfaces or renderModel.projected.normal.z < 0)
            # Render fill and stroke using material and shader.
            renderModel.fill   = surface.fill?.render(lights, @shader, renderModel.transformed)
            renderModel.stroke = surface.stroke?.render(lights, @shader, renderModel.transformed)

            # Round coordinates (if enabled)
            if @fractionalPoints isnt true
              p.round() for p in renderModel.projected.points

            renderModels.push renderModel
    )

    # Sort render models by projected z coordinate. This ensures that the surfaces
    # farthest from the eye are painted first. (Painter's Algorithm)
    renderModels.sort (a, b) ->
      return  b.projected.barycenter.z - a.projected.barycenter.z

    return renderModels

  # Get or create the rendermodel for the given surface. If `@cache` is true, we cache these models
  # to reduce object creation and recomputation.
  _renderSurface : (surface, transform, projection) ->
    if not @cache
      return new seen.RenderModel(surface, transform, projection)

    renderModel = @_renderModelCache[surface.id]
    if not renderModel?
      renderModel = @_renderModelCache[surface.id] = new seen.RenderModel(surface, transform, projection)
    else
      renderModel.update(transform, projection)
    return renderModel

  # Removes all elements from the cache. This may be necessary if you add and
  # remove many shapes from the scene's models since this cache has no
  # eviction policy.
  flushCache : () =>
    @_renderModelCache = {}

